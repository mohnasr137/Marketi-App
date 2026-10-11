const nodemailer = require("nodemailer");
const bcryptjs = require("bcryptjs");
const User = require("../../models/user");

const sendPassEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser) {
      return res.status(404).json({ message: "No user found with this email" });
    }
    if (existingUser.verify === false) {
      return res.status(403).json({
        message: "User email has not been verified. Please verify your email first.",
      });
    }

    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    await User.updateOne({ _id: existingUser._id }, { $set: { code, resetPass: false } });

    if (!process.env.USER || !process.env.PASSWORD) {
      console.warn("Email credentials not configured in .env.");
      return res.status(200).json({
        message: "Password reset code generated (email sending skipped in development)",
        devCode: process.env.NODE_ENV !== "production" ? code : undefined,
      });
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
      to: normalizedEmail,
      subject: "Password Reset Code - Marketi",
      text: `Your password reset code is: ${code}`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #007bff; margin-top: 0;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the verification code below:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background-color: #f0f7ff; color: #007bff; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; border-radius: 6px; border: 1px dashed #007bff;">${code}</span>
        </div>
        <p style="color: #777; font-size: 13px;">This code is valid for 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; margin-bottom: 0;">If you did not request a password reset, please ignore this email.</p>
      </div>
      `,
    });

    return res.status(200).json({ message: "Password reset code sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const activeResetPass = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser) {
      return res.status(404).json({ message: "No user found with this email" });
    }
    if (existingUser.verify === false) {
      return res.status(403).json({ message: "User email has not been verified" });
    }

    if (existingUser.code === String(code).trim()) {
      await User.updateOne({ _id: existingUser._id }, { $set: { resetPass: true } });
      return res.status(200).json({
        message: "Code verified successfully. You may now submit your new password.",
      });
    } else {
      return res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordMatch =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser) {
      return res.status(404).json({ message: "No user found with this email" });
    }
    if (existingUser.verify === false) {
      return res.status(403).json({ message: "User email has not been verified" });
    }
    if (existingUser.resetPass === false) {
      return res.status(400).json({
        message: "Password reset authorization has expired. Please verify your code first.",
      });
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

    const hashedPassword = await bcryptjs.hash(password, 8);
    await User.updateOne(
      { _id: existingUser._id },
      { $set: { password: hashedPassword, resetPass: false, code: "" } }
    );

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendPassEmail,
  activeResetPass,
  resetPassword,
};
