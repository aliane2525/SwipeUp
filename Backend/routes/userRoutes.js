const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const auth = require("../Middleware/authmiddleware");
const User = require("../models/User");

// ================= CURRENT USER =================
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.log("ME ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= UPDATE PROFILE =================
router.put("/update", auth, async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, profileImage },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.log("UPDATE ERROR:", err.message);
    res.status(500).json({ message: "Update failed" });
  }
});

// ================= GET ALL USERS (FIXED) =================
router.get("/all", auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
    }).select("-password");

    res.json(users);
  } catch (err) {
    console.log("USER ALL ERROR:", err.message);
    res.status(500).json({ message: "Server error loading users" });
  }
});
// ================= UPLOAD PROFILE IMAGE =================
router.post(
  "/upload",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          profileImage: req.file.path,
        },
        {
          new: true,
        }
      ).select("-password");

      res.json({
        message: "Profile image uploaded",
        user,
      });

    } catch (err) {
      console.log("UPLOAD ERROR:", err.message);

      res.status(500).json({
        message: "Upload failed",
      });
    }
  }
);

module.exports = router;