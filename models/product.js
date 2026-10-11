const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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
      default: 0,
    },
    location: {
      name: {
        type: String,
        trim: true,
        default: "General",
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    remain: {
      type: Number,
      min: 0,
      default: 0,
    },
    sold: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search and filter indexes
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, brand: 1, price: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
