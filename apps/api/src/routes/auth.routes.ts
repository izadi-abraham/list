import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, refreshTokens } from "../db/schema";
import { jwtPlugin, authPlugin } from "../plugins/auth.plugin";

const REFRESH_TOKEN_TTL_DAYS = 90;

function refreshTokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return d;
}

function generateRefreshToken(): string {
  return crypto.randomUUID() + "-" + crypto.randomUUID();
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)

  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, body.email),
      });
      if (existing) {
        set.status = 409;
        throw new Error("Email already in use");
      }

      const usernameExists = await db.query.users.findFirst({
        where: eq(users.username, body.username),
      });
      if (usernameExists) {
        set.status = 409;
        throw new Error("Username already taken");
      }

      const passwordHash = await Bun.password.hash(body.password);
      const [user] = await db
        .insert(users)
        .values({
          username: body.username,
          email: body.email,
          passwordHash,
          fullName: body.fullName ?? null,
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          locale: users.locale,
          createdAt: users.createdAt,
        });

      const accessToken = await jwt.sign({ sub: user.id });
      const refreshToken = generateRefreshToken();
      await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry(),
      });

      set.status = 201;
      return { user, accessToken, refreshToken };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 2, maxLength: 30 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        fullName: t.Optional(t.String({ maxLength: 100 })),
      }),
    }
  )

  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, body.email),
      });
      if (!user) {
        set.status = 401;
        throw new Error("Invalid email or password");
      }

      const valid = await Bun.password.verify(body.password, user.passwordHash);
      if (!valid) {
        set.status = 401;
        throw new Error("Invalid email or password");
      }

      const accessToken = await jwt.sign({ sub: user.id });
      const refreshToken = generateRefreshToken();
      await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry(),
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          locale: user.locale,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )

  .post(
    "/refresh",
    async ({ body, jwt, set }) => {
      const stored = await db.query.refreshTokens.findFirst({
        where: eq(refreshTokens.token, body.refreshToken),
      });

      if (!stored || stored.expiresAt < new Date()) {
        set.status = 401;
        throw new Error("Invalid or expired refresh token");
      }

      // Rotate: delete old, issue new
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.id, stored.id));

      const accessToken = await jwt.sign({ sub: stored.userId });
      const newRefreshToken = generateRefreshToken();
      await db.insert(refreshTokens).values({
        userId: stored.userId,
        token: newRefreshToken,
        expiresAt: refreshTokenExpiry(),
      });

      return { accessToken, refreshToken: newRefreshToken };
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    }
  )

  .use(authPlugin)
  .post("/logout", async ({ userId, body }) => {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, body.refreshToken));
    return { ok: true };
  }, {
    body: t.Object({
      refreshToken: t.String(),
    }),
  });
