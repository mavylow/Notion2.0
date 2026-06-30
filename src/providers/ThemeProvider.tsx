"use client";

import { observer } from "mobx-react-lite";
import { useEffect, useState, type ReactNode } from "react";
import theme from "@store/themeStore";
import { StorageUtil } from "@/utils/storageUtil";

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = observer(({ children }: ThemeProviderProps) => {
  useEffect(() => {
    const storageTheme = StorageUtil.get("theme");

    if (storageTheme === "light" || storageTheme === "dark") {
      theme.setTheme(storageTheme);
    } else {
      StorageUtil.set("theme", "dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.value);
    StorageUtil.set("theme", theme.value);
  }, [theme.value]);

  return <>{children}</>;
});

export default ThemeProvider;
