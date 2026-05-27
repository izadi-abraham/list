import { Elysia, t } from "elysia";
import { and, eq, or } from "drizzle-orm";
import { db } from "../db";
import { lists, listMembers, users } from "../db/schema";
import { authPlugin } from "../plugins/auth.plugin";

async function requireMember(
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
  return member;
}

async function requireOwner(
  listId: number,
  userId: number,
  set: { status: number | string }
) {
  const member = await requireMember(listId, userId, set);
  if (member.role !== "owner") {
    set.status = 403;
    throw new Error("Only the list owner can perform this action");
  }
  return member;
}

async function requireEditor(
  listId: number,
  userId: number,
  set: { status: number | string }
) {
  const member = await requireMember(listId, userId, set);
  if (member.role === "viewer") {
    set.status = 403;
    throw new Error("You need editor access to modify this list");
  }
  return member;
}

export const listsRoutes = new Elysia({ prefix: "/lists" })
  .use(authPlugin)

  .get("/", async ({ userId }) => {
    const memberships = await db.query.listMembers.findMany({
      where: eq(listMembers.userId, userId),
      with: { list: true },
    });
    return memberships.map((m) => ({ ...m.list, role: m.role }));
  })

  .post(
    "/",
    async ({ userId, body, set }) => {
      const [list] = await db
        .insert(lists)
        .values({ ...body, ownerId: userId })
        .returning();

      await db.insert(listMembers).values({
        listId: list.id,
        userId,
        role: "owner",
      });

      set.status = 201;
      return list;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
        type: t.Union([
          t.Literal("shopping"),
          t.Literal("books"),
          t.Literal("movies"),
          t.Literal("food"),
          t.Literal("custom"),
        ]),
        description: t.Optional(t.String({ maxLength: 500 })),
      }),
    }
  )

  .get("/:listId", async ({ userId, params, set }) => {
    const listId = Number(params.listId);
    await requireMember(listId, userId, set);

    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
      with: {
        items: { orderBy: (items, { asc }) => [asc(items.position)] },
        listMembers: {
          with: {
            user: {
              columns: { id: true, username: true, email: true, fullName: true },
            },
          },
        },
      },
    });

    if (!list) {
      set.status = 404;
      throw new Error("List not found");
    }
    return list;
  })

  .patch(
    "/:listId",
    async ({ userId, params, body, set }) => {
      const listId = Number(params.listId);
      await requireOwner(listId, userId, set);

      const [updated] = await db
        .update(lists)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(lists.id, listId))
        .returning();
      return updated;
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        type: t.Optional(
          t.Union([
            t.Literal("shopping"),
            t.Literal("books"),
            t.Literal("movies"),
            t.Literal("food"),
            t.Literal("custom"),
          ])
        ),
        description: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
      }),
    }
  )

  .delete("/:listId", async ({ userId, params, set }) => {
    const listId = Number(params.listId);
    await requireOwner(listId, userId, set);
    await db.delete(lists).where(eq(lists.id, listId));
    set.status = 204;
  })

  // --- Members ---

  .post(
    "/:listId/members",
    async ({ userId, params, body, set }) => {
      const listId = Number(params.listId);
      await requireOwner(listId, userId, set);

      const invitee = await db.query.users.findFirst({
        where: eq(users.email, body.email),
        columns: { id: true, username: true, email: true, fullName: true },
      });
      if (!invitee) {
        set.status = 404;
        throw new Error("No user found with that email address");
      }

      const existing = await db.query.listMembers.findFirst({
        where: and(
          eq(listMembers.listId, listId),
          eq(listMembers.userId, invitee.id)
        ),
      });
      if (existing) {
        set.status = 409;
        throw new Error("User is already a member of this list");
      }

      await db.insert(listMembers).values({
        listId,
        userId: invitee.id,
        role: body.role,
      });

      set.status = 201;
      return { ...invitee, role: body.role };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        role: t.Union([t.Literal("editor"), t.Literal("viewer")], {
          default: "editor",
        }),
      }),
    }
  )

  .delete("/:listId/members/:memberId", async ({ userId, params, set }) => {
    const listId = Number(params.listId);
    const memberId = Number(params.memberId);
    await requireOwner(listId, userId, set);

    if (memberId === userId) {
      set.status = 400;
      throw new Error("Cannot remove yourself as the owner");
    }

    await db
      .delete(listMembers)
      .where(
        and(eq(listMembers.listId, listId), eq(listMembers.userId, memberId))
      );
    set.status = 204;
  });
