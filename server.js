// server.js - исправленный
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
      origin: [
        "http://localhost:3000",
        "https://notion20-production.up.railway.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowUpgrades: true,
  });

  const roomStates = new Map();

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("join desk", ({ deskId, username }) => {
      socket.join(String(deskId));
      socket.data.deskId = deskId;
      socket.data.username = username;

      console.log(`📌 ${username} joined desk ${deskId}`);

      if (roomStates.has(deskId)) {
        socket.emit("room_state", roomStates.get(deskId));
      }

      io.to(String(deskId)).emit("joined", {
        socketId: socket.id,
        deskId,
        username,
      });
    });

    socket.on("active_note_changed", ({ id, name, value, deskId }) => {
      console.log(`📝 Note changed: ${id}, ${name}=${value}`);
      socket.to(String(deskId)).emit("active_note_changed", {
        id,
        name,
        value,
      });
    });

    socket.on("add_note", (note) => {
      console.log(`➕ Note added: ${note.id} to desk ${note.deskId}`, note);

      const deskId = String(note.deskId);
      if (!roomStates.has(deskId)) {
        roomStates.set(deskId, { notes: [] });
      }
      roomStates.get(deskId).notes.push(note);

      io.to(deskId).emit("add_note", note);
    });

    socket.on("delete_note", ({ id, deskId }) => {
      console.log(`❌ Note deleted: ${id} from desk ${deskId}`);

      const deskIdStr = String(deskId);
      if (roomStates.has(deskIdStr)) {
        roomStates.set(deskIdStr, {
          notes: roomStates.get(deskIdStr).notes.filter((n) => n.id !== id),
        });
      }

      socket.to(deskIdStr).emit("delete_note", { id });
    });

    socket.on("move_note", ({ id, x, y, deskId }) => {
      console.log(`📍 Note moved: ${id} to (${x}, ${y}) in desk ${deskId}`);

      if (roomStates.has(deskId)) {
        const noteIndex = roomStates
          .get(deskId)
          .notes.findIndex((n) => n.id === id);
        if (noteIndex !== -1) {
          roomStates.get(deskId).notes[noteIndex] = { ...note };
        }
      }

      io.to(`${deskId}`).emit("move_note", { id, x, y, deskId });
    });

    socket.on("resize_note", ({ id, height, width, deskId }) => {
      console.log(
        `📍 Note resized: ${id} to (${height}, ${width}) in desk ${deskId}`
      );

      if (roomStates.has(deskId)) {
        const noteIndex = roomStates
          .get(deskId)
          .notes.findIndex((n) => n.id === note.id);
        if (noteIndex !== -1) {
          roomStates.get(deskId).notes[noteIndex] = { ...note };
        }
      }

      io.to(`${deskId}`).emit("resize_note", { id, height, width, deskId });
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.IO server listening on port ${port}`);
  });
});
