import { z } from "zod";

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Username may only contain lowercase letters, numbers, and underscores"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UpdateUserSchema = z.object({
  fullName: z.string().max(100).optional(),
  locale: z.enum(["en", "fa", "nl"]).optional(),
});

export const CreateListSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["shopping", "books", "movies", "food", "custom"]),
  description: z.string().max(500).optional(),
});

export const UpdateListSchema = CreateListSchema.partial();

export const CreateItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive().nullable().optional(),
  unit: z.string().max(20).nullable().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const UpdateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.number().int().positive().nullable().optional(),
  unit: z.string().max(20).nullable().optional(),
  checked: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ReorderItemsSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    position: z.number().int().min(0),
  })
);

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]).default("editor"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateListInput = z.infer<typeof CreateListSchema>;
export type UpdateListInput = z.infer<typeof UpdateListSchema>;
export type CreateItemInput = z.infer<typeof CreateItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;
export type ReorderItemsInput = z.infer<typeof ReorderItemsSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
