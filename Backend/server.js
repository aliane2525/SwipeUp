require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// ================= MODELS =================
const Message = require("./models/Message");
const Notification = require("./models/Notification");

// ================= APP =================
const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ================= HTTP SERVER =================
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    ...corsOptions,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// ================= ONLINE USERS =================
const onlineUsers = new Map();

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("typing", userId);
  });

  socket.on("stop_typing", (roomId) => {
    socket.to(roomId).emit("stop_typing");
  });

  socket.on("send_message", async (data) => {
    try {
      const {
        roomId,
        sender,
        receiverId,
        message,
        image,
        audio,
        video,
        tempId,
      } = data;

      if (!roomId || !sender) return;

      const type = image
        ? "image"
        : audio
        ? "audio"
        : video
        ? "video"
        : "text";

      const newMessage = await Message.create({
        chatId: roomId,
        sender,
        message: message || "",
        image: image || "",
        audio: audio || "",
        video: video || "",
        type,
        status: "delivered",
      });

      io.to(roomId).emit("receive_message", {
        ...newMessage._doc,
        tempId,
      });

      if (receiverId) {
        await Notification.create({
          userId: receiverId,
          senderId: sender,
          type: "message",
          text: "New message 💬",
        });

        const receiverSocket = onlineUsers.get(receiverId);

        if (receiverSocket) {
          io.to(receiverSocket).emit("new_notification", {
            type: "message",
            text: "New message 💬",
          });
        }
      }
    } catch (err) {
      console.log("send_message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// ================= ROUTES =================
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/match", require("./routes/MatchRoutes"));
app.use("/api/chat", require("./routes/ChatRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/moments", require("./routes/momentRoutes"));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "🔥 SwipeUp API Running",
  });
});

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err.message));

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});