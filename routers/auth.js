// packages
const express = require("express");
const passport = require("passport");

// imports
const { signUp, signIn } = require("../controllers/auth/basicAuth");
const { activeEmail } = require("../controllers/auth/verifyEmail");
const {
  sendPassEmail,
  activeResetPass,
  resetPassword,
} = require("../controllers/auth/resetPassword");

// init
const authRouter = express.Router();
const url = process.env.API_URL;

// routers
authRouter.post("/signUp", signUp);
authRouter.post("/signIn", signIn);

// authRouter.get(
//   "/oAuth/google",
//   passport.authenticate("google", { scope: ["profile"] })
// );
// authRouter.get(
//   "/oAuth/google/redirect",
//   passport.authenticate("google"),
//   (req, res) => {
//     res.redirect(301, `${url}/home/start`);
//   }
// );
// authRouter.get(
//   "/oAuth/facebook",
//   passport.authenticate("facebook", { scope: "email" })
// );
// authRouter.get(
//   "/oAuth/facebook/redirect",
//   passport.authenticate("facebook"),
//   (req, res) => {
//     res.redirect(301, `${url}/home/start`);
//   }
// );
// authRouter.get("/oAuth/signOut", (req, res) => {
//   try {
//     req.session.destroy(function (err) {
//       console.log("session destroyed.");
//     });
//     return res.status(200).json({ message: "session destroyed." });
//   } catch (err) {
//     res.status(400).send({ message: "Failed to sign out" });
//   }
// });

authRouter.post("/sendPassEmail", sendPassEmail);
authRouter.post("/activeResetPass", activeResetPass);
authRouter.post("/resetPassword", resetPassword);
authRouter.get("/:token", activeEmail);

module.exports = authRouter;
