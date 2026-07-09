const express = require("express");
const router = express.Router();

const Moment = require("../models/Moment");
const auth = require("../Middleware/authmiddleware");
const upload = require("../Middleware/upload");

// ================= CREATE POST =================
router.post("/create", auth, upload.single("image"), async (req, res) => {
  try {
    const moment = await Moment.create({
      user: req.user.id,
      image: req.file ? req.file.path : "",
      caption: req.body.caption || "",
    });

    const populated = await moment.populate("user", "name profileImage");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= GET POSTS =================
router.get("/", auth, async (req, res) => {
  try {
    const moments = await Moment.find()
      .populate("user", "name profileImage")
      .populate("comments.user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(moments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= LIKE POST =================
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Moment.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.user.id);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= COMMENT ON POST =================
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const post = await Moment.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      user: req.user.id,
      text: req.body.text || "",
    });

    await post.save();
    const updated = await post.populate("comments.user", "name profileImage");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= SHARE POST =================
router.post("/:id/share", auth, async (req, res) => {
  try {
    const post = await Moment.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.shares += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;