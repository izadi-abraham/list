import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
  .use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" }))
  .use(swagger({ path: "/docs" }))
  .get("/health", () => ({ status: "ok" }))
  .listen(Number(process.env.PORT ?? 4000));

console.log(`API running at http://localhost:${app.server?.port}`);

export default app;
