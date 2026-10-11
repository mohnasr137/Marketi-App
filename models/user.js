const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "not determined"],
      default: "not determined",
    },
    address: {
      type: String,
      default: "not determined",
    },
    type: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    resetPass: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: "",
    },
    myProduct: [
      {
        type: String,
        trim: true,
      },
    ],
    cart: [
      {
        type: String,
        trim: true,
      },
    ],
    favorite: [
      {
        type: String,
        trim: true,
      },
    ],
    buyAgain: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
