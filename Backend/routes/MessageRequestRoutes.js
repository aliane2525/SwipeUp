const express = require("express");
const router = express.Router();

const auth = require("../Middleware/authmiddleware");
const MessageRequest = require("../models/MessageRequest");
const Match = require("../models/Match");
const Chat = require("../models/Chat");
const Notification = require("../models/Notification");

// SEND MESSAGE REQUEST
router.post("/:userId", auth, async (req, res) => {
  try {
    const sender = req.user.id;
    const receiver = req.params.userId;
    const text = (req.body.text || "").trim();

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    if (sender === receiver) {
      return res.status(400).json({ message: "Cannot send a request to yourself" });
    }

    const existingMatch = await Match.findOne({
      users: { $all: [sender, receiver] },
    });

    if (existingMatch) {
      return res.status(400).json({ message: "You are already matched" });
    }

    let request = await MessageRequest.findOne({
      sender,
      receiver,
      status: "pending",
    });

    if (!request) {
      request = await MessageRequest.create({
        sender,
        receiver,
        messages: [{ text }],
      });
    } else {
      if (request.messages.length >= 3) {
        return res.status(400).json({
          message: "You reached the 3 message limit",
        });
      }

      request.messages.push({ text });
      await request.save();
    }

    await Notification.create({
      userId: receiver,
      senderId: sender,
      type: "request",
      text: "New message request 💌",
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/received", auth, async (req, res) => {
  try {
    const requests = await MessageRequest.find({
      receiver: req.user.id,
      status: "pending",
    })
      .populate("sender", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/sent", auth, async (req, res) => {
  try {
    const requests = await MessageRequest.find({
      sender: req.user.id,
    })
      .populate("receiver", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/accept/:id", auth, async (req, res) => {
  try {
    const request = await MessageRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" });
    }

    request.status = "accepted";
    await request.save();

    const existingMatch = await Match.findOne({
      users: { $all: [request.sender, request.receiver] },
    });

    if (!existingMatch) {
      await Match.create({
        users: [request.sender, request.receiver],
      });
    }

    let chat = await Chat.findOne({
      members: { $all: [request.sender, request.receiver] },
    });

    if (!chat) {
      chat = await Chat.create({
        members: [request.sender, request.receiver] });
    }

    await Notification.create({
      userId: request.sender,
      senderId: request.receiver,
      type: "message",
      text: "Your message request was accepted 💖",
    });

    res.json({ message: "Accepted", chatId: chat._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/reject/:id", auth, async (req, res) => {
  try {
    const request = await MessageRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" });
    }

    request.status = "rejected";
    await request.save();

    await Notification.create({
      userId: request.sender,
      senderId: request.receiver,
      type: "message",
      text: "Your message request was rejected ❌",
    });

    res.json({ message: "Rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
