const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    liker: String,   // user who liked
    liked: String,   // user who was liked
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", likeSchema);