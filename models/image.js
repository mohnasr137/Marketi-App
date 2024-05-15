const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  name: {
    require: true,
    type: String,
    trim: true,
  },
  userEmail: {
    require: true,
    type: String,
    trim: true,
  },
  data: {
    require: true,
    type: Buffer,
  },
  contentType: {
    require: true,
    type: String,
    trim: true,
  },
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
