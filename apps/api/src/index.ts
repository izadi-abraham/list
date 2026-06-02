import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./routes/auth.routes";
import { usersRoutes } from "./routes/users.routes";
import { listsRoutes } from "./routes/lists.routes";
import { itemsRoutes } from "./routes/items.routes";
import { wsPlugin } from "./plugins/ws.plugin";

const app = new Elysia()
  .use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" }))
  .use(swagger({ path: "/docs" }))
  .onError(({ code, error, request }) => {
    if (code !== "NOT_FOUND" && code !== "VALIDATION") {
      console.error(`[${code}] ${request.method} ${request.url}`, error)
    }
  })
  .get("/health", () => ({ status: "ok" }))
  .use(authRoutes)
  .use(usersRoutes)
  .use(listsRoutes)
  .use(itemsRoutes)
  .use(wsPlugin)
  .listen(Number(process.env.PORT ?? 4000));

console.log(`API running at http://localhost:${app.server?.port}`);

export default app;
