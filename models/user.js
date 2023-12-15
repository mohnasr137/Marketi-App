const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    require: true,
    type: String,
    trim: true,
  },
  phone: {
    require: true,
    type: String,
    trim: true,
  },
  email: {
    require: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: "please enter a valid email",
    },
  },
  password: {
    require: true,
    type: String,
    validate: {
      validator: (value) => {
        return value.length >= 6;
      },
      message: "please enter a long password",
    },
  },
  type: {
    type: String,
    default: "user",
  },
  //cart
});

const User = mongoose.model('User',userSchema);
module.exports = User;

