const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const auth = require("../Middleware/authmiddleware");
const Moment = require("../models/Moment");

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg");
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const getUserId = (req) => req.userId || req.user?.id || req.user?._id || null;

const populateMoment = async (moment) => {
  return await moment
    .populate("user", "name image")
    .populate("comments.user", "name image");
};

router.get("/", auth, async (req, res) => {
  try {
    const moments = await Moment.find()
      .sort({ createdAt: -1 })
      .populate("user", "name image")
      .populate("comments.user", "name image");

    res.json(moments);
  } catch (err) {
    console.log("GET MOMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to load moments" });
  }
});

router.post("/create", auth, upload.single("image"), async (req, res) => {
  try {
    const userId = getUserId(req);
    const caption = req.body.caption?.trim() || "";

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!caption && !req.file) {
      return res.status(400).json({ message: "Please add text or an image" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const moment = await Moment.create({
      user: userId,
      caption,
      image,
    });

    const populated = await populateMoment(moment);
    res.status(201).json(populated);
  } catch (err) {
    console.log("CREATE MOMENT ERROR:", err);
    res.status(500).json({ message: "Failed to create moment" });
  }
});

router.post("/:id/like", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const moment = await Moment.findById(req.params.id);

    if (!moment) {
      return res.status(404).json({ message: "Moment not found" });
    }

    const alreadyLiked = moment.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      moment.likes = moment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      moment.likes.push(userId);
    }

    await moment.save();
    const populated = await populateMoment(moment);
    res.json(populated);
  } catch (err) {
    console.log("LIKE MOMENT ERROR:", err);
    res.status(500).json({ message: "Failed to like moment" });
  }
});

router.post("/:id/comment", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const text = req.body.text?.trim();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const moment = await Moment.findById(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: "Moment not found" });
    }

    moment.comments.push({ user: userId, text });
    await moment.save();

    const populated = await populateMoment(moment);
    res.json(populated);
  } catch (err) {
    console.log("COMMENT MOMENT ERROR:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

router.post("/:id/share", auth, async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: "Moment not found" });
    }

    moment.shares += 1;
    await moment.save();

    const populated = await populateMoment(moment);
    res.json(populated);
  } catch (err) {
    console.log("SHARE MOMENT ERROR:", err);
    res.status(500).json({ message: "Failed to share moment" });
  }
});

module.exports = router;