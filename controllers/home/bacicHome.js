const pathDir = require("path");
const fs = require("fs");
const User = require("../../models/user");
const Product = require("../../models/product");
const Image = require("../../models/image");
const Brand = require("../../models/brand");
const Category = require("../../models/category");

const addProduct = async (req, res) => {
  try {
    const pathsArray = req.files.map((obj) => obj.path);
    const {
      title,
      price,
      description,
      locationName,
      coordinatesX,
      coordinatesY,
      discount,
      remain,
      brand,
      category,
    } = req.body;
    const product = new Product({
      title,
      price,
      description,
      images: pathsArray,
      location: {
        name: locationName,
        location: {
          type: "Point",
          coordinates: [coordinatesX, coordinatesY],
        },
      },
      discount,
      remain,
      brand,
      category,
    });
    await product.save();
    return res.status(200).json({ product, message: "product created.." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const pathsArray = req.files.map((obj) => obj.path);
    const {
      id,
      title,
      price,
      description,
      locationName,
      coordinatesX,
      coordinatesY,
      discount,
      remain,
      brand,
      category,
    } = req.body;
    const existingProduct = await Product.findOne({ _id: id });
    console.log(existingProduct);
    if (existingProduct) {
      const query = {};
      if (title) query.title = title;
      if (price) query.price = price;
      if (description) query.description = description;
      if (locationName || coordinatesX || coordinatesY) {
        if (!locationName) {
          return res.status(400).json({ message: "please enter locationName" });
        }
        if (!coordinatesX) {
          return res.status(400).json({ message: "please enter coordinatesX" });
        }
        if (!coordinatesY) {
          return res.status(400).json({ message: "please enter coordinatesY" });
        }
        query.location = {
          name: locationName,
          location: {
            type: "Point",
            coordinates: [coordinatesX, coordinatesY],
          },
        };
      }
      if (discount) query.discount = discount;
      if (remain) query.remain = remain;
      if (brand) query.brand = brand;
      if (category) query.category = category;
      if (pathsArray.length != 0) query.images = pathsArray;
      console.log(query);
      await Product.updateOne({ _id: id }, { $set: query });
      const existingProduct = await Product.findOne({ _id: id });
      console.log(existingProduct);
      return res
        .status(200)
        .json({ existingProduct, message: "product edited.." });
    } else {
      return res.status(200).json({ message: "product not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const existingProduct = await Product.findOne({ _id: id });
    if (existingProduct) {
      for (let i = 0; i < existingProduct.images.length; i++) {
        fs.unlinkSync(
          pathDir.join(__dirname, `../../${existingProduct.images[i]}`)
        );
      }
      await Product.deleteOne({ _id: id });
      return res.status(200).json({ message: "product deleted.." });
    } else {
      return res.status(200).json({ message: "product not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
};
