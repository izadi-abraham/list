import type { ServerWebSocket } from "bun";

const rooms = new Map<number, Set<ServerWebSocket<unknown>>>();

export function joinRoom(listId: number, ws: ServerWebSocket<unknown>): void {
  if (!rooms.has(listId)) rooms.set(listId, new Set());
  rooms.get(listId)!.add(ws);
}

export function leaveRoom(listId: number, ws: ServerWebSocket<unknown>): void {
  rooms.get(listId)?.delete(ws);
  if (rooms.get(listId)?.size === 0) rooms.delete(listId);
}

export function broadcast(
  listId: number,
  message: object,
  exclude?: ServerWebSocket<unknown>
): void {
  const payload = JSON.stringify(message);
  rooms.get(listId)?.forEach((ws) => {
    if (ws !== exclude) ws.send(payload);
  });
}
