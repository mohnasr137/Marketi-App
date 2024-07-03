const mongoose = require("mongoose");
const Category = require("./category");

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 1.3,
    },
    location: {
      name: {
        type: String,
        trim: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
          default: [0, 0],
        },
      },
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    remain: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      min: 0,
    },
    category: {
      required: true,
      type: String,
      trim: true,
    },
    brand: {
      required: true,
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
