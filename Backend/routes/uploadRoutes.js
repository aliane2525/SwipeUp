const express = require("express");
const router = express.Router();

const auth = require("../Middleware/authmiddleware");
const upload = require("../Middleware/upload");
const User = require("../models/User");

// =====================================
// Upload Profile Picture
// POST /api/upload/profile
// =====================================
router.post(
  "/profile",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image.",
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      user.profileImage = req.file.path;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully.",
        profileImage: user.profileImage,
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Server error while uploading image.",
      });
    }
  }
);

module.exports = router;