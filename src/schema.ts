import { t } from "i18next";
import z from "zod";

export const AuthSchema = z.object({
  email: z.email("Write correct email"),
  password: z
    .string()
    .min(8, t("shortPassword"))
    .max(14, t("longPassword"))
    .regex(/[0-9]/, t("passwordContainNumber")),
});

export const CommentSchema = z.object({
  postId: z.number(),
  text: z.string().max(30),
});

export const DeskSchema = z.object({
  name: z.string().nonempty().max(20),
  link: z.string().optional(),
  public: z.boolean(),
});

export const NoteSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
  desk: z.boolean(),
  x: z.number(),
  y: z.number(),
  height: z.number().optional(),
  width: z.number().optional(),
  deskId: z.number(),
  createdAt: z.string(),
});

export const PostSchema = z.object({
  title: z.string().max(20).nonempty(),
  content: z.string().max(200).nullable(),
  image: z.string().nullable(),
});

export const ProfileUpdateSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});
