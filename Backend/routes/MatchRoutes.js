const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Chat = require("../models/Chat");
const Match = require("../models/Match");
const Notification = require("../models/Notification");

const auth = require("../Middleware/authmiddleware");

// ======================================================
// LIKE USER
// ======================================================
router.post("/like/:targetId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.targetId;

    // prevent liking yourself
    if (userId === targetId) {
      return res.status(400).json({
        message: "You cannot like yourself",
      });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // prevent duplicate likes
    if (!user.liked.includes(targetId)) {
      user.liked.push(targetId);
    }

    let match = false;
    let chat = null;

    // ==================================================
    // MATCH CHECK
    // ==================================================
    if (target.liked.includes(userId)) {
      match = true;

      // add matches
      if (!user.matches.includes(targetId)) {
        user.matches.push(targetId);
      }

      if (!target.matches.includes(userId)) {
        target.matches.push(userId);
      }

      // create match record
      const existingMatch =
        await Match.findOne({
          users: {
            $all: [userId, targetId],
          },
        });

      if (!existingMatch) {
        await Match.create({
          users: [userId, targetId],
        });
      }

      // create chat room
      chat = await Chat.findOne({
        members: { $all: [userId, targetId] },
      });

      if (!chat) {
        chat = await Chat.create({
          members: [userId, targetId],
        });
      }

      // notification
      await Notification.create({
        userId: targetId,
        senderId: userId,
        type: "match",
        text: "You got a new match ❤️",
      });
    } else {
      // normal like notification
      await Notification.create({
        userId: targetId,
        senderId: userId,
        type: "like",
        text: "Someone liked you ❤️",
      });
    }

    await user.save();
    await target.save();

    res.json({
      success: true,
      match,
      chatId: chat ? chat._id : null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ======================================================
// DISLIKE USER
// ======================================================
router.post(
  "/dislike/:targetId",
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const targetId = req.params.targetId;

      const user = await User.findById(userId);

      if (!user.disliked.includes(targetId)) {
        user.disliked.push(targetId);
      }

      await user.save();

      res.json({
        success: true,
        message: "User disliked",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// ======================================================
// GET MY MATCHES
// ======================================================
router.get("/matches", auth, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user.id,
    })
      .populate(
        "users",
        "name profileImage bio"
      )
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;