const express = require("express");
const router = express.Router();

const Notification = require(
  "../models/Notification"
);

const auth = require(
  "../Middleware/authmiddleware"
);

// GET MY NOTIFICATIONS
router.get("/", auth, async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        userId: req.user.id,
      })
        .populate("senderId", "name profileImage")
        .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// MARK AS READ
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification =
      await Notification.findById(
        req.params.id
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.read = true;

    await notification.save();

    res.json({
      message: "Notification read",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;