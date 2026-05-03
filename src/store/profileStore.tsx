"use client";

import type { TProfilePages } from "@/interfaces";
import { createContext } from "react";
import { create } from "zustand";

interface IProfilePageContext {
  profilePage: TProfilePages;
  changePage: (page: TProfilePages) => void;
}

export const useProfilePage = create<IProfilePageContext>((set) => ({
  profilePage: "info",
  changePage: (page: TProfilePages) => {
    localStorage.setItem("profile", page);
    set({ profilePage: page });
  },
}));

export const ProfilePageContext = createContext<IProfilePageContext>({
  profilePage: "info",
  changePage: () => {},
});
