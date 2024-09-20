// packages
const path = require("path");
const fs = require("fs").promises;

// imports
const Product = require("../../models/product");
const Category = require("../../models/category");
const Brand = require("../../models/brand");
const TopSearch = require("../../models/topSearch");

// init
const url = process.env.API_URL;

// routers
const allProducts = async (req, res) => {
  try {
    const { skip, search, brand, category, rating, price, discount, popular } =
      req.body;
    const query = {};
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
      const existingSearch = await TopSearch.findOne({
        $or: [{ data: { $regex: search, $options: "i" } }],
      });
      if (existingSearch) {
        const number = existingSearch.number + 1;
        await TopSearch.updateOne(
          { _id: existingSearch._id },
          { $set: { number } }
        );
      } else {
        const topSearch = new TopSearch({ data: search });
        await topSearch.save();
      }
    }
    const sort = {};
    if (rating) sort.rating = rating === "up" ? 1 : -1;
    if (price) sort.price = price === "up" ? 1 : -1;
    if (discount) sort.discount = discount === "up" ? 1 : -1;
    if (popular) {
      sort.rating = -1;
      sort.sold = -1;
    }
    const list = await Product.find(query)
      .sort(sort)
      .skip(skip * 10)
      .limit(10)
      .exec();
    if (list.length === 0) {
      return res.status(404).json({ message: "No results found." });
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allCategories = async (req, res) => {
  try {
    const { name } = req.body;
    let list;
    if (name) {
      list = await Category.find({}, { name: 1, _id: 0 });
    } else {
      list = await Category.find();
    }
    if (list.length == 0) {
      return res.status(404).json({ message: "there is no result" });
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allBrands = async (req, res) => {
  try {
    const { name } = req.body;
    let list;
    if (name) {
      list = await Brand.find({}, { name: 1, _id: 0 });
    } else {
      list = await Brand.find();
    }
    if (list.length == 0) {
      return res.status(404).json({ message: "there is no result" });
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allTopSearch = async (req, res) => {
  try {
    const list = await TopSearch.find().sort({ number: -1 }).limit(10).exec();
    if (list.length == 0) {
      return res.status(404).json({ message: "there is no result" });
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allBanners = async (req, res) => {
  try {
    let list = [];
    const directoryPath = path.join(__dirname, "../../images/banners");
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
      const imagePath = path.join(`${url}/images/banners`, file);
      list.push(imagePath);
    }
    if (list.length == 0) {
      return res.status(404).json({ message: "there is no result" });
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  allProducts,
  allBrands,
  allCategories,
  allBanners,
  allTopSearch,
  allBanners,
};
