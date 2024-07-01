const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
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

const Category = mongoose.model("Categorie", categorySchema);
module.exports = Category;
