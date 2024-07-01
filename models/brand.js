const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
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

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
