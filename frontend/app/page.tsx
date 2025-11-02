"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  message: string;
  author: string;
  time: string;
}

let socket: Socket;

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [joined, setJoined] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const NEXT_PUBLIC_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  // console.log('NEXT_PUBLIC_SOCKET_URL', NEXT_PUBLIC_SOCKET_URL)

  useEffect(() => {
    if (!joined) usernameRef.current?.focus();
  }, [joined]);

  useEffect(() => {
    console.log('NEXT_PUBLIC_SOCKET_URL', NEXT_PUBLIC_SOCKET_URL)
    socket = io(NEXT_PUBLIC_SOCKET_URL!);

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
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const atBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    setIsAtBottom(atBottom); // dùng state để biết user đang ở cuối hay không
  };

  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (isAtBottom) {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat]);


  if (!joined) {
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
        <h1 style={{ fontSize: "clamp(24px, 6vw, 48px)", fontWeight: "bold", marginBottom: 40, textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
          Welcome to Chat App
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
            width: "90%",
            maxWidth: 400,
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

  return (
    <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", minHeight: "100vh", padding: 10, boxSizing: "border-box" }}>
      {/* <div
        style={{
          position: 'absolute',
          padding: '15px 20px',
          margin: '10px',
          backgroundColor: '#4338ca',
          borderRadius: '20px',
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        <h6>Welcome to Chat App, {username}!</h6>
      </div> */}

      <div style={{
        maxWidth: 600,
        width: "90%",
        height: "90vh",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        // background: "#f3f4f6",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}>
        {/* Top bar */}
        <div style={{
          padding: '15px 20px',
          background: "#ff6b81",
          color: 'black',
          fontWeight: 'bold',
          fontSize: 18,
          textAlign: 'center'
        }}>
          Chat App
        </div>

        {/* Chat messages */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            // justifyContent: "flex-end",
            overflowY: "auto",
            // backgroundColor: 'red'
          }}
          onScroll={handleScroll}
        >
          {chat.map((msg, i) => {
            const isMe = msg.author === username;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  marginBottom: 16,
                }}
              >
                {!isMe && (
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#ff6b81",
                    color: "black",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    marginRight: 8,
                    fontSize: 12,
                  }}>
                    {msg.author[0].toUpperCase()}
                  </div>
                )}

                <div style={{
                  background: isMe ? "#4f46e5" : "#e5e7eb",
                  color: isMe ? "white" : "black",
                  padding: "10px 15px",
                  borderRadius: 20,
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}>
                  <div>{msg.message}</div>
                  <div style={{ fontSize: 10, marginTop: 4 }}>
                    {msg.time}
                  </div>
                </div>

                {isMe && (
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#4338ca",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    marginLeft: 8,
                    fontSize: 12,
                  }}>
                    {msg.author[0].toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{
          display: "flex",
          padding: 10,
          flexWrap: "wrap",
          gap: 10,
          // background: "#fff",
        }}>
          <input
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              minWidth: 0,
              padding: 12,
              borderRadius: 20,
              border: "1px solid #4338ca",
              outline: "none",
              fontSize: 16,
              color: 'black',
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "12px 20px",
              borderRadius: 20,
              border: "none",
              background: "#4338ca",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
