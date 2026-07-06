import { useEffect, useState, useRef } from "react";
import API from "../api";
import socket from "../socket";
import "./chat.css";

export default function Chat({ roomId }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  // LOAD MESSAGES
  useEffect(() => {
    if (!roomId) return;
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    try {
      const res = await API.get(`/api/chat/messages/${roomId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // SOCKET
  useEffect(() => {
    if (!roomId) return;

    socket.emit("join_room", roomId);

    const handleMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m._id === msg._id || m.tempId === msg.tempId
        );
        return exists ? prev : [...prev, msg];
      });
    };

    socket.on("receive_message", handleMessage);
    socket.on("typing", setTypingUser);
    socket.on("stop_typing", () => setTypingUser(null));

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [roomId]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // TYPING
  const handleTyping = (value) => {
    setText(value);

    socket.emit("typing", {
      roomId,
      userId: user._id,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", roomId);
    }, 1000);
  };

  // SEND
  const sendMessage = () => {
    if (!text.trim()) return;

    const tempId = Date.now();

    const msg = {
      _id: tempId,
      tempId,
      sender: user._id,
      message: text,
      type: "text",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, msg]);

    socket.emit("send_message", {
      roomId,
      sender: user._id,
      message: text,
      tempId,
    });

    setText("");
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-body">
        {messages.map((m) => (
          <MessageBubble key={m._id} message={m} user={user} />
        ))}

        {typingUser && <div className="typing">typing...</div>}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

// MESSAGE COMPONENT
function MessageBubble({ message, user }) {
  const isMe = message.sender === user._id;

  return (
    <div className={`bubble ${isMe ? "me" : "other"}`}>
      {message.type === "text" && (
        <div>{message.message}</div>
      )}

      {message.image && (
        <div className="media">
          <img src={message.image} alt="" />
          <a href={message.image} download>Download</a>
        </div>
      )}

      {message.video && (
        <div className="media">
          <video controls src={message.video} />
          <a href={message.video} download>Download</a>
        </div>
      )}

      {message.audio && (
        <div className="media">
          <audio controls src={message.audio} />
          <a href={message.audio} download>Download</a>
        </div>
      )}

      <div className="time">
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
