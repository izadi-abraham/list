import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { authPlugin } from "../plugins/auth.plugin";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)

  .get("/me", async ({ userId, set }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        locale: true,
        createdAt: true,
      },
    });
    if (!user) {
      set.status = 404;
      throw new Error("User not found");
    }
    return user;
  })

  .patch(
    "/me",
    async ({ userId, body }) => {
      const [updated] = await db
        .update(users)
        .set({
          ...(body.fullName !== undefined && { fullName: body.fullName }),
          ...(body.locale !== undefined && { locale: body.locale }),
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          locale: users.locale,
          createdAt: users.createdAt,
        });
      return updated;
    },
    {
      body: t.Object({
        fullName: t.Optional(t.Nullable(t.String({ maxLength: 100 }))),
        locale: t.Optional(t.Union([t.Literal("en"), t.Literal("fa"), t.Literal("nl")])),
      }),
    }
  );
