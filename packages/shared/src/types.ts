export type ListType = "shopping" | "books" | "movies" | "food" | "custom";
export type MemberRole = "owner" | "editor" | "viewer";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  locale: string;
  createdAt: string;
}

export interface List {
  id: number;
  ownerId: number;
  name: string;
  type: ListType;
  description: string | null;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ListMember {
  listId: number;
  userId: number;
  role: MemberRole;
  joinedAt: string;
  user?: Pick<User, "id" | "username" | "email" | "fullName">;
}

export interface ListItem {
  id: number;
  listId: number;
  name: string;
  position: number;
  checked: boolean;
  quantity: number | null;
  unit: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

// WebSocket message protocol
export type WsMessage =
  | { type: "connected"; listId: number }
  | { type: "item:created"; payload: ListItem }
  | { type: "item:updated"; payload: ListItem }
  | { type: "item:deleted"; payload: { id: number } }
  | { type: "item:reordered"; payload: Array<{ id: number; position: number }> }
  | { type: "member:added"; payload: ListMember }
  | { type: "member:removed"; payload: { userId: number } };
