import z from "zod";
import {
  AuthSchema,
  CommentSchema,
  DeskSchema,
  NoteSchema,
  PostSchema,
  ProfileUpdateSchema,
} from "@/schema";

export interface IPost {
  id: number;
  authorId: number;
  title: string;
  content: string;
  image: string;
  likesCount: number;
  commentsCount: number;
  creationDate: string;
  modifiedDate: string;
  authorPhoto: string;
  likedByUsers: IUser[];
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  profileImage?: string;
  description?: string;
  bio?: string;
  secondName?: string;
  likesCount?: number;
  lastLogin?: string;
  creationDate?: string;
  modifiedDate?: string;
}

export interface IComment {
  id: number;
  text: string;
  authorId: number;
  postId: number;
  creationDate: string;
  modifiedDate: string;
}

export interface ILike {
  id: number;
  postId: number;
  userId: number;
  creationDate: string;
}

export interface IGroup {
  id: number;
  title: string;
  photo: string;
  membersCount: number;
}

export interface ISidebarUser {
  id: number;
  username: string;
  firstName: string;
  secondName: string;
  description: string;
  profileImage: string;
}

export interface IProfileForm {
  image?: string;
  username: string;
  email: string;
  description?: string;
}
export interface ILike {
  id: number;
  postId: number;
  userId: number;
  creationDate: string;
}

export interface YearStats {
  [year: number]: MonthStat[];
}

export interface MonthStat {
  month: number;
  count: number;
  previousCount: number;
}

export type TProfilePages = "info" | "statistics";

export type IModal = {
  id: number;
  isOpen: boolean;
  message: string;
  status: modalStatus;
};

export type modalStatus = "success" | "error" | "warning" | null;

export type TNoteAdd = z.infer<typeof NoteSchema>;

export type HttpMethod =
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH";

export type RouteMatch = {
  route: RegExp;
  method: HttpMethod;
};

export type ITag = INote & { isActive: boolean };

export type TComment = z.infer<typeof CommentSchema>;

export type TAuth = z.infer<typeof AuthSchema>;

export type TDesk = z.infer<typeof DeskSchema>;

export type TPostForm = z.infer<typeof PostSchema>;

export type TProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export type INote = z.infer<typeof NoteSchema>;
