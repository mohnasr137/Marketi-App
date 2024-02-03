const express = require("express");
const {signUp,signIn} = require("../controllers/auth")
const {activeEmail} = require("../controllers/verify")
const authRouter = express.Router();

authRouter.post("/signUp", signUp);
authRouter.post("/signIn", signIn);
authRouter.get("/verify/:token", activeEmail);

module.exports = authRouter;
