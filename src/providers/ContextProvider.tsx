"use client";

import type { ReactNode } from "react";
import AuthProvider from "@providers/AuthProvider";
import ThemeProvider from "@providers/ThemeProvider";
import PopUpProvider from "@providers/PopupProvider";
import SocketProvider from "./SocketProvider";

interface IContextProvider {
  children: ReactNode;
}
function ContextProvider({ children }: IContextProvider) {
  return (
    <PopUpProvider>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </PopUpProvider>
  );
}

export default ContextProvider;
