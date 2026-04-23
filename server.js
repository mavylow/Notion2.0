// server.js
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowUpgrades: true,
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("active_note_changed", (data) => {
      console.log("📨 Message:", data);

      io.emit("active_note_changed", {
        ...data,
      });
    });
    socket.on("add_note", (data) => {
      io.emit("add_note", {
        ...data,
      });
    });

    socket.on("delete_note", (data) => {
      io.emit("delete_note", {
        ...data,
      });
    });
    socket.on("move_note", (data) => {
      console.log(data);
      io.emit("move_note", {
        ...data,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.IO server listening on port ${port}`);
  });
});
