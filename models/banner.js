const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
  name: {
    require: true,
    type: String,
    trim: true,
  },
  imagePath: {
    require: true,
    type: String,
    trim: true,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
