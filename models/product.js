const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  id: {
    require: true,
    type: Number,
    trim: true,
  },
  title: {
    require: true,
    type: String,
    trim: true,
  },
  price: {
    require: true,
    type: Number,
    trim: true,
  },
  description: {
    require: true,
    type: String,
    trim: true,
  },
  image: {
    require: true,
    type: String,
    trim: true,
  },
  rating: {
    require: true,
    type: Number,
    trim: true,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
