const mongoose = require("mongoose");
const Product = require("../models/product");

const userSchema = mongoose.Schema({
  name: {
    require: true,
    type: String,
    trim: true,
  },
  phone: {
    require: true,
    type: String,
    trim: true,
  },
  email: {
    require: true,
    type: String,
    unique: true,
    trim: true,
  },
  password: {
    require: true,
    type: String,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "not determined",
  },
  address: {
    type: String,
    default: "not determined",
  },
  type: {
    type: String,
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
    require: true,
    type: String,
    trim: true,
  },
  code: {
    type: String,
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
});

const User = mongoose.model("User", userSchema);
module.exports = User;
