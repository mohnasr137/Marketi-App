const express = require("express");
const { signUp, signIn } = require("../controllers/auth/basicAuth");
const { activeEmail } = require("../controllers/auth/verifyEmail");
const {
  sendPassEmail,
  activeResetPass,
  resetPassword,
} = require("../controllers/auth/resetPassword");

const authRouter = express.Router();

// Basic Authentication
authRouter.post("/signUp", signUp);
authRouter.post("/signIn", signIn);

// Password Reset Workflow
authRouter.post("/sendPassEmail", sendPassEmail);
authRouter.post("/activeResetPass", activeResetPass);
authRouter.post("/resetPassword", resetPassword);

// Email Verification
authRouter.get("/verify/:token", activeEmail);
authRouter.get("/:token", activeEmail); // Backward compatibility

module.exports = authRouter;
