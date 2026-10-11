const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

const sendVerifyEmail = async (email, link) => {
  try {
    if (!process.env.USER || !process.env.PASSWORD) {
      console.warn("Nodemailer credentials not configured in .env. Skipping email sending.");
      return;
    }
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: "Account Verification - Market-i",
      text: `Welcome! Please verify your account by clicking the following link: ${link}`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #007bff; margin-top: 0;">Welcome to Market-i!</h2>
        <p>Thank you for signing up. Please verify your email address to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #007bff; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #777; font-size: 13px;">If clicking the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #555; font-size: 12px; word-break: break-all;">${link}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; margin-bottom: 0;">If you did not create a Market-i account, please safely ignore this email.</p>
      </div>
      `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error.message);
  }
};

const activeEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET || "secret_key");
    } catch (jwtErr) {
      return res.status(400).json({
        message: jwtErr.name === "TokenExpiredError" ? "Verification link has expired" : "Invalid verification token",
      });
    }

    const existingUser = await User.findById(decoded.id);
    if (!existingUser) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (existingUser.verify === true) {
      return res.status(200).json({ message: "Email is already verified. You can log in." });
    }

    if (existingUser.code !== decoded.code) {
      return res.status(400).json({ message: "Invalid or outdated verification code" });
    }

    await User.updateOne({ _id: decoded.id }, { $set: { verify: true, code: "" } });
    return res.status(200).json({
      message: "Email successfully verified. Your account is now active.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendVerifyEmail,
  activeEmail,
};
