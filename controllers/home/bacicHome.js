const User = require("../../models/user");
const Product = require("../../models/product");
const Image = require("../../models/image");
const Brand = require("../../models/brand");
const Category = require("../../models/category");

const addProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      images,
      locationName,
      coordinates,
      discount,
      remain,
      brand,
      category,
    } = req.body;
    const product = new Product({
      title,
      price,
      description,
      images: [generateRandomImageUrl()],
      location: {
        name: locationName,
        location: {
          type: "Point",
          coordinates,
        },
      },
      discount,
      remain,
      brand,
      category,
    });
    await product.save();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
};
