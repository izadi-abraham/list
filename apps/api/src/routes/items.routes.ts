import { Elysia, t } from "elysia";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { items, listMembers } from "../db/schema";
import { authPlugin } from "../plugins/auth.plugin";
import { broadcast } from "../lib/broadcast";

async function requireEditor(
  listId: number,
  userId: number,
  set: { status: number | string }
) {
  const member = await db.query.listMembers.findFirst({
    where: and(eq(listMembers.listId, listId), eq(listMembers.userId, userId)),
  });
  if (!member) {
    set.status = 403;
    throw new Error("Access denied");
  }
  if (member.role === "viewer") {
    set.status = 403;
    throw new Error("You need editor access to modify items");
  }
  return member;
}

export const itemsRoutes = new Elysia({ prefix: "/lists/:listId/items" })
  .use(authPlugin)

  .post(
    "/",
    async ({ userId, params, body, set }) => {
      const listId = Number(params.listId);
      await requireEditor(listId, userId, set);

      const maxPosition = await db
        .select({ max: sql<number>`COALESCE(MAX(${items.position}), -1)` })
        .from(items)
        .where(eq(items.listId, listId));

      const [item] = await db
        .insert(items)
        .values({
          listId,
          name: body.name,
          quantity: body.quantity ?? null,
          unit: body.unit ?? null,
          metadata: body.metadata ?? {},
          position: (maxPosition[0]?.max ?? -1) + 1,
        })
        .returning();

      broadcast(listId, { type: "item:created", payload: item });
      set.status = 201;
      return item;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 200 }),
        quantity: t.Optional(t.Nullable(t.Integer({ minimum: 1 }))),
        unit: t.Optional(t.Nullable(t.String({ maxLength: 20 }))),
        metadata: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )

  .patch(
    "/:itemId",
    async ({ userId, params, body, set }) => {
      const listId = Number(params.listId);
      const itemId = Number(params.itemId);
      await requireEditor(listId, userId, set);

      const existing = await db.query.items.findFirst({
        where: and(eq(items.id, itemId), eq(items.listId, listId)),
      });
      if (!existing) {
        set.status = 404;
        throw new Error("Item not found");
      }

      const updates: Partial<typeof existing> = { updatedAt: new Date() };
      if (body.name !== undefined) updates.name = body.name;
      if (body.quantity !== undefined) updates.quantity = body.quantity;
      if (body.unit !== undefined) updates.unit = body.unit;
      if (body.checked !== undefined) updates.checked = body.checked;
      if (body.position !== undefined) updates.position = body.position;
      if (body.metadata !== undefined) updates.metadata = body.metadata;

      const [updated] = await db
        .update(items)
        .set(updates)
        .where(and(eq(items.id, itemId), eq(items.listId, listId)))
        .returning();

      broadcast(listId, { type: "item:updated", payload: updated });
      return updated;
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        quantity: t.Optional(t.Nullable(t.Integer({ minimum: 1 }))),
        unit: t.Optional(t.Nullable(t.String({ maxLength: 20 }))),
        checked: t.Optional(t.Boolean()),
        position: t.Optional(t.Integer({ minimum: 0 })),
        metadata: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )

  .delete("/:itemId", async ({ userId, params, set }) => {
    const listId = Number(params.listId);
    const itemId = Number(params.itemId);
    await requireEditor(listId, userId, set);

    const existing = await db.query.items.findFirst({
      where: and(eq(items.id, itemId), eq(items.listId, listId)),
    });
    if (!existing) {
      set.status = 404;
      throw new Error("Item not found");
    }

    await db
      .delete(items)
      .where(and(eq(items.id, itemId), eq(items.listId, listId)));

    broadcast(listId, { type: "item:deleted", payload: { id: itemId } });
    set.status = 204;
  })

  .put(
    "/reorder",
    async ({ userId, params, body, set }) => {
      const listId = Number(params.listId);
      await requireEditor(listId, userId, set);

      await Promise.all(
        body.map(({ id, position }) =>
          db
            .update(items)
            .set({ position, updatedAt: new Date() })
            .where(and(eq(items.id, id), eq(items.listId, listId)))
        )
      );

      broadcast(listId, { type: "item:reordered", payload: body });
      return { ok: true };
    },
    {
      body: t.Array(
        t.Object({
          id: t.Integer({ minimum: 1 }),
          position: t.Integer({ minimum: 0 }),
        })
      ),
    }
  );
