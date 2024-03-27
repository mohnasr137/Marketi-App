const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    require: true,
    type: String,
    trim: true,
  },
  facebookID: {
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

const facebookUser = mongoose.model("FacebookUser", userSchema);
module.exports = facebookUser;
