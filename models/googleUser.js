const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    require: true,
    type: String,
    trim: true,
  },
  googleID: {
    require: true,
    type: String,
    trim: true,
  },
  type: {
    type: String,
    default: "user",
  },
  verify: {
    type: Boolean,
    default: true,
  },
  resetPass: {
    type: Boolean,
    default: false,
  },
  code: {
    type: String,
  },
  //cart
});

const googleUser = mongoose.model("GoogleUser", userSchema);
module.exports = googleUser;
