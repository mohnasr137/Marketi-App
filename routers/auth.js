const express = require("express");
const passport = require("passport");
const { signUp, signIn } = require("../controllers/auth");
const {
  activeEmail,
  // resetVerCode,
  sendPassCode,
  resetPassCode,
  activePass,
  resetPass,
} = require("../controllers/verify");
const authRouter = express.Router();

authRouter.post("/signUp", signUp);
authRouter.post("/signIn", signIn);
// authRouter.post("/verify/resetVerCode", resetVerCode);
authRouter.get(
  "/oAuth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
authRouter.get(
  "/oAuth/google/redirect",
  passport.authenticate("google"),
  (req, res) => {
    return res.status(200).json({ message: "google oAuth successfully login" });
  }
);

authRouter.get(
  "/oAuth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);
authRouter.get(
  "/oAuth/facebook/redirect",
  passport.authenticate("facebook"),
  (req, res) => {
    return res
      .status(200)
      .json({ message: "facebook oAuth successfully login" });
  }
);

authRouter.get("/oAuth/signOut", (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log("session destroyed.");
    });
    return res.status(200).json({ message: "session destroyed." });
  } catch (err) {
    res.status(400).send({ message: "Failed to sign out" });
  }
});
//ddddddddddddddddddddddddddddddddddddddddddddd
authRouter.post("/verify/sendPassCode", sendPassCode);
authRouter.post("/verify/activePass", activePass);
authRouter.post("/verify/resetPassCode", resetPassCode);
authRouter.post("/verify/resetPass", resetPass);
authRouter.get("/verify/:token", activeEmail);

module.exports = authRouter;
