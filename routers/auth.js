const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const authRouter = express.Router();

//sign up
authRouter.post("/signUp", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "the user with same email already exists!" });
    }
    const re =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!email.match(re)) {
      return res.status(400).json({ message: "please enter a valid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "please enter a long password" });
    }
    const hashedPassword = await bcryptjs.hash(password, 8);
    let user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
    });
    user = await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = authRouter;
