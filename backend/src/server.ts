import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

const FRONTEND_URL = process.env.FRONTEND_URL
const PORT = process.env.PORT || 4000

// 🔹 Kiểm tra giá trị env
console.log("FRONTEND_URL =", FRONTEND_URL);
console.log("PORT =", PORT);

const app = express();
app.use(cors({
  origin: FRONTEND_URL, // dùng env
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

interface ChatMessage {
  message: string;
  author: string;
}

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
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

// server.listen(4000, () => console.log("Server running at http://localhost:4000"));
server.listen(PORT, () => console.log("Server running..."));
