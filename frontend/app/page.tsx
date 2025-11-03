"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

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
  // const [height, setHeight] = useState("100dvh");
  const [botOnline, setBotOnline] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const NEXT_PUBLIC_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  const NEXT_PUBLIC_FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const robotAvatar = "https://cdn-icons-png.flaticon.com/512/4712/4712100.png";

  // console.log('NEXT_PUBLIC_SOCKET_URL', NEXT_PUBLIC_SOCKET_URL)

  // useEffect(() => {
  //   const updateHeight = () => {
  //     setHeight(`${window.innerHeight}px`);
  //   };

  //   updateHeight();
  //   window.addEventListener("resize", updateHeight);
  //   return () => window.removeEventListener("resize", updateHeight);
  // }, []);

  useEffect(() => {
    if (!joined) usernameRef.current?.focus();
  }, [joined]);

  // useEffect(() => {
  //   console.log('NEXT_PUBLIC_SOCKET_URL', NEXT_PUBLIC_SOCKET_URL)
  //   socket = io(NEXT_PUBLIC_SOCKET_URL!);

  //   socket.on("receive_message", (data: ChatMessage) => {
  //     setChat(prev => [...prev, data]);
  //   });

  //   return () => {
  //     socket.off("receive_message");
  //   };
  // }, []);

  useEffect(() => {
    console.log("NEXT_PUBLIC_SOCKET_URL", NEXT_PUBLIC_SOCKET_URL);

    socket = io(NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"], // ✅ fix polling error
    });

    socket.on("receive_message", (data: ChatMessage) => {
      if (data.author === "Bot") setBotOnline(true);
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
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
    //home
    return (
      <div style={{
        height: "100dvh",
        // height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        flexDirection: "column",
        color: "#fff",
        // backgroundColor: 'red'
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

  //chat
  return (
    <div style={{
      height: '100dvh',
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      padding: 10,
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
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
        width: "100%",
        height: "97dvh",
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
        {/* Bot status pill */}
        <div style={{
          padding: "6px 12px",
          margin: "6px auto",
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 500,
          display: "inline-flex",
          gap: 6,
          alignItems: "center",
          background: botOnline ? "#10b981" : "#6b7280",
          color: "white"
        }}>
          {botOnline ? (
            <>
              <img
                src={robotAvatar}
                alt="bot avatar"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#fff",
                }}
              />
              <span>
                <b>Bot</b> đang online - thêm từ <b style={{ color: "yellow" }}>bot</b> trong tin nhắn để chat với <b>Bot</b>
              </span>
            </>
          ) : (
            <>
              <img
                src={robotAvatar}
                alt="bot avatar"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#fff",
                }}
              />
              <span>
                <b>Bot</b> đang offline - nhắn <b style={{ color: "yellow" }}>bot</b> để gọi <b>Bot</b>
              </span>
            </>
          )}
        </div>

        <div style={{
          textAlign: "center",
          marginBottom: 6,
          fontSize: 11,
          color: "#f1f5f9",
          opacity: 0.8
        }}>
          <Link
            href={NEXT_PUBLIC_FRONTEND_URL || "https://localhost:3000"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff" }}
          >+ thêm người chat</Link>
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
            const isBot = msg.author === "Bot";
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
                {isBot ? (
                  <img
                    src={isBot && robotAvatar} // avatar user default
                    alt="avatar"
                    style={{
                      objectFit: "cover",
                      background: "#fff",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      color: "black",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                      marginRight: 8,
                      fontSize: 12,
                    }}
                  />
                ) : (
                  !isMe && (
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
                  )
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
