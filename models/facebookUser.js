const mongoose = require("mongoose");

const facebookUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    facebookID: {
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

const FacebookUser = mongoose.model("FacebookUser", facebookUserSchema);
module.exports = FacebookUser;
