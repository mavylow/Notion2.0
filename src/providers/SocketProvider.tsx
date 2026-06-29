"use client";

import { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface PropsSocketProvider {
  children: React.ReactNode;
}
interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
  sendSocketMessage: (type: string, payload: any) => void;
}

const initialValue = {
  socket: null,
  isConnected: false,
  sendSocketMessage: () => {},
};

export const SocketContext = createContext<ISocketContext>(initialValue);

function SocketProvider({ children }: PropsSocketProvider) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      upgrade: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      withCredentials: true,
      rejectUnauthorized: false,
      secure: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  function sendSocketMessage(type: string, payload: any) {
    if (socketRef.current && isConnected) {
      console.log(`📤 Sending: ${type}`, payload);
      socketRef.current.emit(type, payload);
    } else {
      console.warn(`⚠️ Socket not ready. Connected: ${isConnected}`);
    }
  }

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, isConnected, sendSocketMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export default SocketProvider;
