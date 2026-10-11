const mongoose = require("mongoose");

const googleUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    googleID: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      default: "user",
    },
    verify: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const GoogleUser = mongoose.model("GoogleUser", googleUserSchema);
module.exports = GoogleUser;
