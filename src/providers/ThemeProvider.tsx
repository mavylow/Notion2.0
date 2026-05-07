"use client";

import { observer } from "mobx-react-lite";
import { useEffect, useState, type ReactNode } from "react";
import theme from "@store/themeStore";
import { StorageUtil } from "@/utils/storageUtil";

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = observer(({ children }: ThemeProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const storageTheme = StorageUtil.get("theme");

    if (storageTheme === "light" || storageTheme === "dark") {
      theme.setTheme(storageTheme);
    } else {
      StorageUtil.set("theme", "dark");
    }

    setIsInitialized(true);
  }, [mounted]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    document.documentElement.setAttribute("data-theme", theme.value);
    StorageUtil.set("theme", theme.value);
  }, [theme.value, isInitialized, mounted]);

  return <>{children}</>;
});

export default ThemeProvider;
