const express = require("express");
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
authRouter.post("/verify/sendPassCode", sendPassCode);
authRouter.post("/verify/activePass", activePass);
authRouter.post("/verify/resetPassCode", resetPassCode);
authRouter.post("/verify/resetPass", resetPass);
authRouter.get("/verify/:token", activeEmail);

module.exports = authRouter;
