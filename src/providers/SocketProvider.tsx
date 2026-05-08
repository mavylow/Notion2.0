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
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        transports: ["websocket", "polling"],
        autoConnect: true,
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  function sendSocketMessage(type: string, payload: any) {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(type, payload);
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
