const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const twilio = require("twilio")(
  process.env.WILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verifyEmail = async (email, code, link) => {
  try {
    console.log("here");
    if (link) {
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
        subject: `Account Verification`,
        text: "Welcome",
        html: `
      <dev>
      <h3>Click to Verification: <a href=${link}>Verify</a></h3>
      <h4>if it was not you please ignore this message</h4>
      </dev>
      `,
      });
      console.log("Verification email send successfully");
    } else {
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
        subject: `Account resetPassword`,
        text: "Welcome",
        html: `
      <dev>
      <h3>resetPassword Code: </h3>
      <h1 style="color:red;">${code}</h1>
      </dev>
      `,
      });
      console.log("resetPassword email send successfully");
    }
    // let transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: process.env.USER,
    //     pass: process.env.PASSWORD,
    //   },
    // });
    // let info = await transporter.sendMail({
    //   from: process.env.USER,
    //   to: email,
    //   subject: `Account ${about}`,
    //   text: "Welcome",
    //   html: `
    //   <dev>
    //   <h3>${about} Code: </h3>
    //   <h1 style="color:red;">${code}</h1>
    //   </dev>
    //   `,
    // });
    // console.log(`${about} email send successfully`);
  } catch (error) {
    console.log(error);
  }
};

const phoneCode = async (phone, code) => {
  // try {
  //   let message = await twilio.messages.create({
  //     from: process.env.TWILIO_NUMBER,
  //     to: phone,
  //     body: `
  //     <dev>
  //     <h3>resetPassword Code: </h3>
  //     <h1 style="color:red;">${code}</h1>
  //     </dev>
  //     `,
  //   });
  //   console.log(message);
  // } catch (error) {
  //   console.log(error);
  // }
};

const activeEmail = async (req, res) => {
  // try {
  //   const id = res.locals.id;
  //   await User.updateOne({ _id: id }, { $set: { verify: true } });
  //   return res.status(200).json({ message: "email is verified" });
  // } catch (error) {
  //   return res.status(500).json({ message: error.message });
  // }
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: "no token" });
    }
    console.log(token);
    const isVerify = jwt.verify(token, process.env.SECRET);
    if (!isVerify) {
      return res.status(400).json({ message: "not verify" });
    }
    const existingUser = await User.findById(isVerify.id);
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "the user with this email not found!" });
    }
    const code = isVerify.code;
    const id = isVerify.id;
    console.log(id);
    if (existingUser.verify === false) {
      if (existingUser.code === code) {
        await User.updateOne({ _id: id }, { $set: { verify: true } });
        return res.status(200).json({ message: "email verifyed" });
      } else {
        return res.status(400).json({ message: "wrong code" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "this email is already verifyed!" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// const resetVerCode = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (!existingUser) {
//       return res
//         .status(400)
//         .json({ message: "the user with this email not found!" });
//     }
//     if (existingUser.verify === true) {
//       return res
//         .status(400)
//         .json({ message: "this email is already verifyed!" });
//     } else {
//       const code = `${Math.floor(100000 + Math.random() * 900000)}`;
//       await User.updateOne({ email }, { $set: { code } });
//       verifyEmail(email, code, true);
//       return res
//         .status(200)
//         .json({ message: "verification code reset successfully" });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

const sendPassCode = async (req, res) => {
  try {
    const { email } = req.body;
    const byGmail = true;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "the user with this email not found!" });
    }
    if (existingUser.verify === false) {
      return res
        .status(400)
        .json({ message: "the user with this email not verifyed!" });
    }
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    await User.updateOne({ email }, { $set: { code } });
    if (byGmail) {
      verifyEmail(email, code);
      return res
        .status(200)
        .json({ message: "password code send successfully" });
    } else {
      phoneCode(existingUser.phone, code);
      return res
        .status(200)
        .json({ message: "phone code send successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const activePass = async (req, res) => {
  try {
    const { email, code } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "the user with this email not found!" });
    }
    if (existingUser.verify === false) {
      return res
        .status(400)
        .json({ message: "the user with this email not verifyed!" });
    }
    if (existingUser.code === code) {
      await User.updateOne({ email }, { $set: { resetPass: true } });
      return res.status(200).json({ message: "you can reset password" });
    } else {
      return res.status(400).json({ message: "wrong code" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassCode = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "the user with this email not found!" });
    }
    if (existingUser.verify === false) {
      return res
        .status(400)
        .json({ message: "the user with this email not verifyed!" });
    }
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    await User.updateOne({ email }, { $set: { code } });
    verifyEmail(email, code);
    return res
      .status(200)
      .json({ message: "password code reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPass = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const passwordMatch =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!password.match(passwordMatch)) {
      return res.status(400).json({ message: "please enter a valid password" });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "password and confirm password are not the same" });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "the user with this email not found!" });
    }
    if (existingUser.verify === false) {
      return res
        .status(400)
        .json({ message: "the user with this email not verifyed!" });
    }
    if (existingUser.resetPass === false) {
      return res
        .status(400)
        .json({ message: "this email not activated to reset password!" });
    }
    const hashedPassword = await bcryptjs.hash(password, 8);
    await User.updateOne(
      { email },
      { $set: { password: hashedPassword, resetPass: false } }
    );
    return res.status(200).json({ message: "password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyEmail,
  activeEmail,
  // resetVerCode,
  sendPassCode,
  resetPassCode,
  activePass,
  resetPass,
};
