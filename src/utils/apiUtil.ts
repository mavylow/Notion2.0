import { IDesk } from "@/interfaces";
import axios, { type AxiosRequestConfig } from "axios";
import { ParamValue } from "next/dist/server/request/params";

export type apiMethod = "GET" | "POST" | "PUT" | "DELETE";
export const API_URL = "http://localhost:3001";

export async function fetchRESTData(
  api: string,
  method: apiMethod,
  body?: string
) {
  const token = localStorage.getItem("token");

  const config: AxiosRequestConfig = {
    method: method.toLowerCase(),
    url: api,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  };

  if (token) {
    config.headers!.Authorization = `Bearer ${token}`;
  }

  if (body && method !== "GET") {
    config.data = body;
  }

  try {
    const response = await axios(config);

    if (method === "DELETE") {
      if (response.status === 204 || response.status === 200) {
        return { success: true };
      }
    }

    if (response.status === 204) {
      return null;
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (method === "DELETE" && error.response?.status === 404) {
        return { success: true, alreadyDeleted: true };
      }
      throw new Error(error.response?.data?.message || "Data fetching error");
    }
    throw error;
  }
}

export async function fetchGraphQLData(body?: string) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(error);
  }
}

export const loadPosts = async () => {
  const posts = await fetchRESTData(`api/posts`, "GET");
  return posts.data;
};

export const addPostsAxios = async (newPost: string) => {
  await fetchRESTData("/api/posts", "POST", newPost);
};

export const loadUser = async (userId: number) => {
  const user = await fetchRESTData(`/api/profile/${userId}`, "GET");
  return user.data;
};

export const loginUser = async (loginForm: string) => {
  const user = await fetchRESTData("/api/login", "POST", loginForm);
  return user.data;
};

export const logoutUser = async () => {
  await fetchRESTData("/api/logout", "GET");
};

export const loadLikes = async (id: number) => {
  const likes = await fetchRESTData(`/api/posts/${id}/likes`, "GET");
  return likes.data;
};

export const restoreUser = async () => {
  const user = await fetchRESTData("/api/me", "GET");
  return user.data;
};

export const signUpUser = async (singUpForm: string) => {
  const user = await fetchRESTData("/api/signup", "POST", singUpForm);
  return user.data;
};

export const updateUserAxios = async (updatedUser: string) => {
  const user = await fetchRESTData("/api/profile", "PUT", updatedUser);
  return user.data;
};

export const loadPostComments = async (postId: number) => {
  const comments = await fetchRESTData(`/api/posts/${postId}/comments`, "GET");
  return comments.data;
};

export const deleteComment = async (commentId: number) => {
  await fetchRESTData(`/api/comments/${commentId}`, "DELETE");
};

export const addComment = async (commentData: string) => {
  await fetchRESTData("/api/comments", "POST", commentData);
};

export const likePost = async (postId: number) => {
  await fetchRESTData("api/like", "POST", JSON.stringify({ postId }));
};

export const dislikePost = async (postId: number) => {
  await fetchRESTData("api/dislike", "POST", JSON.stringify({ postId }));
};

export const getSuggested = async () => {
  const suggested = await fetchRESTData("/api/getSuggested", "GET");
  return suggested.data;
};

export const getGroups = async () => {
  const groups = await fetchRESTData("/api/groups", "GET");
  return groups.data;
};

export const getStatisticLikes = async () => {
  const likes = await fetchRESTData(`/api/me/likes`, "GET");
  return likes.data;
};

export const getStatisticPosts = async () => {
  const posts = await fetchRESTData(`/api/me/posts`, "GET");
  return posts.data;
};

export const getStatisticComments = async () => {
  const comments = await fetchRESTData(`/api/me/comments`, "GET");
  return comments.data;
};

export const getNotes = (page: number, per_page: number) => {
  const res = fetchRESTData(
    `${API_URL}/notes/page/${page}/per/${per_page}`,
    "GET"
  );
  return res;
};

export const getNote = async (id: number | string) => {
  const note = await fetchRESTData(`/api/note/${id}`, "GET");
  return note.data;
};

export const deleteNote = async (id: number) => {
  await fetchRESTData(`/api/note/${id}`, "DELETE");
  return id;
};

export const getDesks = async () => {
  const desks = await fetchRESTData(`/api/desks`, "GET");
  return desks.data;
};
export const createDesk = async (newDesk: IDesk) => {
  const desk = await fetchRESTData(
    `/api/desks`,
    "POST",
    JSON.stringify(newDesk)
  );
  return desk;
};

export const deleteDeskById = async (id: number) => {
  await fetchRESTData(`/api/desks`, "DELETE", JSON.stringify(id));
};

export const getAllNotes = async (id: ParamValue) => {
  const res = await fetch(`/api/all_notes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const result = await res.json();
  return result.data;
};
