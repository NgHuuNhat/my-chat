import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "local"}` });

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

console.log("✅ FRONTEND_URL =", FRONTEND_URL);
console.log("✅ PORT =", PORT);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);

const server = http.createServer(app);

interface ChatMessage {
  message: string;
  author: string;
  time: string;
}

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// ✅ Gemini instance
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

io.on("connection", (socket: Socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("send_message", async (data: ChatMessage) => {
    io.emit("receive_message", data);

    // ✅ If user message starts with @bot or bot is mentioned → reply
    if (
      data.message.toLowerCase().startsWith("@bot") ||
      data.message.includes("bot")
    ) {
      try {
        const prompt = data.message.replace("@bot", "").trim();
        const res = await model.generateContent(prompt);
        const reply = res.response.text();

        const botMessage: ChatMessage = {
          message: reply,
          author: "Bot",
          time: data.time,
        };

        io.emit("receive_message", botMessage);
      } catch (err) {
        io.emit("receive_message", {
          message: "❌ Bot lỗi, thử lại sau.",
          author: "Bot",
          time: data.time,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
