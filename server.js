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
    socket.on("join desk", ({ deskId, username }) => {
      socket.join(String(deskId));
      io.to(String(deskId)).emit("joined", {
        socketId: socket.id,
        deskId,
        username,
      });
    });

    socket.on("active_note_changed", ({ id, name, value, deskId }) => {
      console.log(id, name, value, deskId);
      io.to(String(deskId)).emit("active_note_changed", {
        id,
        name,
        value,
      });
    });

    socket.on("add_note", (note) => {
      console.log("server", note);
      io.to(`${note.deskId}`).emit("add_note", {
        ...note,
      });
    });

    socket.on("delete_note", (note) => {
      io.to(`${note.deskId}`).emit("delete_note", {
        ...note,
      });
    });
    socket.on("move_note", (note) => {
      console.log(note);
      io.to(`${note.deskId}`).emit("move_note", {
        ...note,
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
