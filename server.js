import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

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
        "http://localhost:3001",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
      allowEIO3: true,
    },
    transports: ["websocket", "polling"],
    allowUpgrades: true,
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  const roomStates = new Map();

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("join desk", ({ deskId, username }) => {
      socket.join(String(deskId));
      socket.data.deskId = deskId;
      socket.data.username = username;

      console.log(`📌 ${username} joined desk ${deskId}`);

      if (roomStates.has(String(deskId))) {
        socket.emit("room_state", roomStates.get(String(deskId)));
      }

      io.to(String(deskId)).emit("joined", {
        socketId: socket.id,
        deskId,
        username,
      });
    });

    socket.on("CHANGE", ({ id, name, value, deskId }) => {
      console.log(`📝 Note changed: ${id}, ${name}=${value}`);
      socket.to(String(deskId)).emit("CHANGE", {
        id,
        name,
        value,
      });
    });

    socket.on("ADD", (data) => {
      const deskId = String(data.deskId);
      console.log(`➕ Note added: ${data.id} to desk ${deskId}`);

      if (!roomStates.has(deskId)) {
        roomStates.set(deskId, { notes: [] });
      }

      if (!roomStates.get(deskId).notes.find((n) => n.id === data.id)) {
        roomStates.get(deskId).notes.push(data);
      }

      io.to(deskId).emit("ADD", data);
    });

    socket.on("DELETE", ({ id, deskId }) => {
      const deskIdStr = String(deskId);
      console.log(`❌ Note deleted: ${id} from desk ${deskIdStr}`);

      if (roomStates.has(deskIdStr)) {
        const state = roomStates.get(deskIdStr);
        state.notes = state.notes.filter((n) => n.id !== id);
      }

      io.to(deskIdStr).emit("DELETE", { id });
    });

    socket.on("MOVE", ({ id, x, y, deskId }) => {
      const deskIdStr = String(deskId);
      console.log(`📍 Note moved: ${id} to (${x}, ${y}) in desk ${deskIdStr}`);

      if (roomStates.has(deskIdStr)) {
        const noteIndex = roomStates
          .get(deskIdStr)
          .notes.findIndex((n) => n.id === id);
        if (noteIndex !== -1) {
          roomStates.get(deskIdStr).notes[noteIndex].x = x;
          roomStates.get(deskIdStr).notes[noteIndex].y = y;
        }
      }

      io.to(deskIdStr).emit("MOVE", { id, x, y });
    });

    socket.on("RESIZE", ({ id, height, width, deskId }) => {
      const deskIdStr = String(deskId);
      console.log(
        `📏 Note resized: ${id} to (${height}x${width}) in desk ${deskIdStr}`
      );

      if (roomStates.has(deskIdStr)) {
        const noteIndex = roomStates
          .get(deskIdStr)
          .notes.findIndex((n) => n.id === id);
        if (noteIndex !== -1) {
          roomStates.get(deskIdStr).notes[noteIndex].height = height;
          roomStates.get(deskIdStr).notes[noteIndex].width = width;
        }
      }

      io.to(deskIdStr).emit("RESIZE", { id, height, width });
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.IO server listening on port ${port}`);
  });
});
