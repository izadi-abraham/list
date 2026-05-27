import { Elysia, t } from "elysia";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { listMembers } from "../db/schema";
import { jwtPlugin } from "./auth.plugin";
import { joinRoom, leaveRoom } from "../lib/broadcast";

export const wsPlugin = new Elysia()
  .use(jwtPlugin)
  .ws("/ws/lists/:id", {
    query: t.Object({ token: t.String() }),

    async open(ws) {
      const listId = Number(ws.data.params.id);
      const { token } = ws.data.query;

      const payload = await ws.data.jwt.verify(token);
      if (!payload || typeof payload.sub !== "number") {
        ws.close(4001, "Unauthorized");
        return;
      }

      const member = await db.query.listMembers.findFirst({
        where: and(
          eq(listMembers.listId, listId),
          eq(listMembers.userId, payload.sub as number)
        ),
      });
      if (!member) {
        ws.close(4003, "Forbidden");
        return;
      }

      joinRoom(listId, ws.raw);
      ws.send(JSON.stringify({ type: "connected", listId }));
    },

    close(ws) {
      leaveRoom(Number(ws.data.params.id), ws.raw);
    },

    message() {
      // clients are receive-only; server pushes all changes via broadcast()
    },
  });
