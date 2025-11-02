import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

interface ChatMessage {
  message: string;
  author: string;
}

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] }
});

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data: ChatMessage) => {
    io.emit("receive_message", data); // broadcast cho tất cả client
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(4000, () => console.log("Server running at http://localhost:4000"));
