const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { sendVerifyEmail } = require("./verifyEmail");

const signUp = async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;
    const apiUrl = process.env.API_URL || "/api/v1";
    const defaultAvatar = `${req.protocol}://${req.get("host")}${apiUrl}/portfolio/simple.jpg`;

    if (!name || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const nameMatch = /^[A-Za-z0-9\s-_]{2,50}$/;
    const emailMatch =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const passwordMatch =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    if (!nameMatch.test(name.trim())) {
      return res.status(400).json({
        message: "Please enter a valid name (2-50 characters, letters, numbers, spaces)",
      });
    }
    if (!emailMatch.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (!passwordMatch.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (#?!@$%^&*-)",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password do not match" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.verify === true) {
      return res.status(400).json({ message: "A user with this email already exists!" });
    }
    if (existingUser && existingUser.verify === false) {
      await User.deleteOne({ email: normalizedEmail });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;

    const user = new User({
      name: name.trim(),
      phone: phone.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      code,
      image: defaultAvatar,
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, code: code },
      process.env.SECRET || "secret_key",
      { expiresIn: "24h" }
    );
    const link = `${req.protocol}://${req.get("host")}${apiUrl}/auth/verify/${token}`;

    await sendVerifyEmail(user.email, link);

    return res.status(201).json({
      message: "User registered successfully. Verification email sent.",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (user.verify === false) {
      return res.status(403).json({
        message: "User email has not been verified. Please check your inbox.",
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET || "secret_key",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      name: user.name,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        type: user.type,
      },
      statusCode: 200,
      status: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { signUp, signIn };
