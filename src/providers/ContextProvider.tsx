"use client";

import type { ReactNode } from "react";
import AuthProvider from "@providers/AuthProvider";
import ThemeProvider from "@providers/ThemeProvider";
import PopUpProvider from "@providers/PopupProvider";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import SocketProvider from "./SocketProvider";

interface IContextProvider {
  children: ReactNode;
}
function ContextProvider({ children }: IContextProvider) {
  return (
    <DndProvider backend={HTML5Backend}>
      <PopUpProvider>
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SocketProvider>
        </AuthProvider>
      </PopUpProvider>
    </DndProvider>
  );
}

export default ContextProvider;
