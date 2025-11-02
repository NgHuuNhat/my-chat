"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  message: string;
  author: string;
  time: string; // thời gian đầy đủ
}

let socket: Socket;

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [joined, setJoined] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!joined) usernameRef.current?.focus();
  }, [joined]);

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("receive_message", (data: ChatMessage) => {
      setChat(prev => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const joinChat = () => {
    if (!username) return;
    setJoined(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const dd = now.getDate().toString().padStart(2, "0");
    const mmth = (now.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = now.getFullYear();
    return `${hh}:${mm} ${dd}/${mmth}/${yyyy}`;
  };

  const sendMessage = () => {
    if (!message) return;
    const msgData: ChatMessage = { message, author: username, time: getCurrentTime() };
    socket.emit("send_message", msgData);
    setMessage("");
    inputRef.current?.focus();
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!joined) {
    //home
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        flexDirection: "column",
        color: "#fff",
      }}>
        <h1 style={{ fontSize: 48, fontWeight: "bold", marginBottom: 40, textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
          Welcome to Chat
        </h1>
        <input
          ref={usernameRef}
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") joinChat(); }}
          placeholder="Enter your username"
          style={{
            padding: "15px 20px",
            borderRadius: 12,
            border: "none",
            fontSize: 18,
            width: 300,
            marginBottom: 20,
            outline: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        />
        <button
          onClick={joinChat}
          style={{
            padding: "15px 30px",
            fontSize: 18,
            fontWeight: "bold",
            borderRadius: 12,
            border: "none",
            background: "#ff6b81",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#ff4757")}
          onMouseOut={e => (e.currentTarget.style.background = "#ff6b81")}
        >
          Join Chat
        </button>
      </div>
    );
  }

  const otherUsername = chat.find(msg => msg.author !== username)?.author || "Someone";

  //chat
  return (
    <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f3f4f6",
        width: '600px',
        margin: 'auto',
      }}>
        {/* Top bar */}
        <div style={{
          padding: '15px 20px',
          background: "#ff6b81",
          borderRadius: 20,
          margin: 10,
          color: 'black',
          fontWeight: 'bold',
          fontSize: 18,
          textAlign: 'center'
        }}>
          {otherUsername}
        </div>

        {/* Chat messages */}
        <div style={{
          flex: 1,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflowY: "auto",
        }}>
          {chat.map((msg, i) => {
            const isMe = msg.author === username;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div style={{
                  background: isMe ? "#4f46e5" : "#ff6b81",
                  color: isMe ? "white" : "black",
                  padding: "10px 15px",
                  borderRadius: 20,
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  fontSize: 14,
                }}>
                  {/* {!isMe && <b style={{ fontSize: 12 }}>{msg.author}</b>} */}
                  <div>{msg.message}</div>
                  {isMe ? (
                    <div style={{ fontSize: 10, textAlign: 'right', marginTop: 4 }}>
                      {msg.time}
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, textAlign: 'left', marginTop: 4 }}>
                      {msg.time}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", padding: 10 }}>
          <input
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Type your message...`}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 20,
              border: "1px solid #4338ca",
              outline: "none",
              fontSize: 16,
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              marginLeft: 10,
              padding: "12px 20px",
              borderRadius: 20,
              border: "none",
              background: "#4338ca",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#4338ca")}
            onMouseOut={e => (e.currentTarget.style.background = "#ff6b81")}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
