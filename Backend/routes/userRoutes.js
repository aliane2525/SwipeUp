const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const auth = require("../Middleware/authmiddleware");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
    const { name, bio, profileImage, email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      name,
      bio,
      profileImage,
    };

    let responsePayload = {};

    if (user.email.toLowerCase() !== normalizedEmail) {
      const verificationCode = generateVerificationCode();
      const emailResult = await sendEmail(normalizedEmail, verificationCode);

      if (!emailResult.ok) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      updateData.email = normalizedEmail;
      updateData.emailVerified = false;
      updateData.verificationCode = verificationCode;
      updateData.verificationExpires = Date.now() + 10 * 60 * 1000;

      responsePayload.verificationSent = true;
      responsePayload.message = "Verification code sent to your new email.";
    } else {
      updateData.email = normalizedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ user: updatedUser, ...responsePayload });
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