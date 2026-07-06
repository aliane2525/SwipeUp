const mongoose = require("mongoose");

const momentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    image: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 hours
    },
  }
);

module.exports = mongoose.model(
  "Moment",
  momentSchema
);