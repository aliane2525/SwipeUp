const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: function (v) {
          return v.length === 2;
        },
        message: "A match must contain exactly 2 users",
      },
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
  }
);

// 🔥 Prevent duplicate matches (A-B same as B-A)
matchSchema.index(
  { users: 1 },
  { unique: true }
);

module.exports = mongoose.model("Match", matchSchema);