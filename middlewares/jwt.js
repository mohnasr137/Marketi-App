const jwt = require("jsonwebtoken");
const User = require("../models/user");
const url = process.env.API_URL;
const arr = [
  { url: `${url}/auth/signUp`, method: "POST" },
  { url: `${url}/auth/signIn`, method: "POST" },
  { url: `${url}/can`, method: "POST" },
];
const authJwt = async (req, res, next) => {
  try {
    for (let i = 0; i < arr.length; i++) {
      if (req.url === arr[i].url && req.method === arr[i].method) {
        return next();
      }
    }
    const token = req.body.token;
    if (!token) {
      return res.status(500).json("no token");
    }
    const isVerify = jwt.verify(token, process.env.SECRET);
    if (!isVerify) {
      return res.status(500).json("not verify");
    }
    const user = await User.findById(isVerify.id);
    return res.json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = authJwt;
