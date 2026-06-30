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

export interface Note {
  id: number;
  userId: string;
  title: string;
  body: string;
  desk: boolean;
  x: number;
  y: number;
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

export interface IForm {
  email: string;
  password: string;
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

export interface INote {
  userId: number;
  id: number;
  title: string;
  body: string;
  desk: boolean;
  x: number;
  height?: number;
  width?: number;
  y: number;
  deskId: number;
  createdAt: string;
}

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

export interface IDesk {
  name: string;
  public: boolean;
}
