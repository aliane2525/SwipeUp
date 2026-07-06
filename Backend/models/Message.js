const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ================= MESSAGE CONTENT =================

    message: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: null,
    },

    audio: {
      type: String,
      default: null,
    },

    video: {
      type: String,
      default: null,
    },

    // ================= TYPE CONTROL =================

    type: {
      type: String,
      enum: ["text", "image", "audio", "video"],
      default: "text",
      index: true,
    },

    // ================= STATUS =================

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    // ================= OPTIONAL FUTURE FEATURES =================

    seenAt: {
      type: Date,
      default: null,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);