"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function SimpleSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Инициализируем соединение
    const socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("message", (data) => {
      console.log("📨 Received:", data);
      setMessages((prev) => [...prev, `${data.socketId}: ${data.text}`]);
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

  const sendMessage = () => {
    if (!socketRef.current || !input.trim() || !isConnected) return;

    socketRef.current.emit("message", {
      text: input,
    });

    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Simple Chat</h2>

      <div>Status: {isConnected ? "🟢 Online" : "🔴 Offline"}</div>

      <div style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
