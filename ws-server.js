const { WebSocketServer } = require("ws");
const http = require("http");

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws, req) {
  ws.on("message", function incoming(message) {
    ws.send(`Эхо от сервера: ${message}`);
  });

  ws.on("close", () => {});

  ws.send("Добро пожаловать на WebSocket сервер!");
});

const PORT = 1234;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket сервер запущен на ws://localhost:${PORT}`);
});
