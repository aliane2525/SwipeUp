const express = require("express");
const router = express.Router();

const Chat = require("../models/Chat");
const Message = require("../models/Message");

const auth = require("../Middleware/authmiddleware");

// ======================================================
// GET USER CHATS
// ======================================================
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      members: req.user.id,
    })
      .populate("members", "name profileImage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/chats/:userId", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      members: req.user.id,
    })
      .populate("members", "name profileImage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ======================================================
// GET MESSAGES OF A CHAT
// ======================================================
router.get(
  "/messages/:chatId",
  auth,
  async (req, res) => {
    try {
      const messages = await Message.find({
        chatId: req.params.chatId,
      }).sort({ createdAt: 1 });

      res.json(messages);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ======================================================
// SEND MESSAGE (TEXT + IMAGE + AUDIO + VIDEO)
// ======================================================
router.post("/message", auth, async (req, res) => {
  try {
    const {
      chatId,
      message,
      image,
      audio,
      video,
    } = req.body;

    // VALIDATION
    if (
      !message &&
      !image &&
      !audio &&
      !video
    ) {
      return res.status(400).json({
        message:
          "Message cannot be empty",
      });
    }

    // TYPE DETECTION
    const type = image
      ? "image"
      : audio
      ? "audio"
      : video
      ? "video"
      : "text";

    const newMessage =
      await Message.create({
        chatId,
        sender: req.user.id,
        message: message || "",
        image: image || "",
        audio: audio || "",
        video: video || "",
        type,
        status: "sent",
      });

    // ==================================================
    // SOCKET EMIT (REAL-TIME UPDATE)
    // ==================================================
    const io = req.app.get("io");
    if (io) {
      io.to(chatId).emit(
        "receive_message",
        newMessage
      );
    }

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;