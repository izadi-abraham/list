import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";

export const jwtPlugin = new Elysia({ name: "jwt" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
    exp: "15m",
  })
);

export const authPlugin = new Elysia({ name: "auth" })
  .use(jwtPlugin)
  .use(bearer())
  .resolve({ as: "scoped" }, async ({ jwt, bearer, set }) => {
    if (!bearer) {
      set.status = 401;
      throw new Error("Unauthorized");
    }
    const payload = await jwt.verify(bearer);
    if (!payload || typeof payload.sub !== "number") {
      set.status = 401;
      throw new Error("Invalid or expired token");
    }
    return { userId: payload.sub as number };
  });
