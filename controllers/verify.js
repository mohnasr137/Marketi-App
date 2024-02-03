const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyEmail = async (email, link) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });
    let info = await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: "Account Verification",
      text: "Welcome",
      html: `
      <dev>
      <a href=${link}>Click here to activate your account</a>
      </dev>
      `,
    });
    console.log("email send successfully");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const activeEmail = async (req, res) => {
  try {
    const id = res.locals.id;
    await User.updateOne({ _id: id }, { $set: { verify: true } });
    return res.status(200).json({ message: "email is verified" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyEmail,
  activeEmail,
};
