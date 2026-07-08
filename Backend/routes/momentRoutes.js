const express = require("express");
const router = express.Router();

const Moment = require("../models/Moment");

const auth = require("../Middleware/authmiddleware");
const upload = require("../Middleware/upload");

// ================= CREATE MOMENT =================
router.post(
  "/create",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const moment = await Moment.create({
        user: req.user.id,
        image: req.file.path,
        caption: req.body.caption,
      });

      res.json(moment);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ================= GET MOMENTS =================
router.get("/", auth, async (req, res) => {
  try {
    const moments = await Moment.find()
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(moments);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;