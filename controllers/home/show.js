const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const mongoose = require("mongoose");

const Product = require("../../models/product");
const Category = require("../../models/category");
const Brand = require("../../models/brand");
const TopSearch = require("../../models/topSearch");
const Banner = require("../../models/banner");

const url = process.env.API_URL || "/api/v1";

const allProducts = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    const { search, brand, category, rating, price, discount, popular } = params;
    const skip = Math.max(0, parseInt(params.skip, 10) || 0);
    const limit = Math.max(1, Math.min(100, parseInt(params.limit, 10) || 10));

    const query = {};
    if (brand) query.brand = brand;
    if (category) query.category = category;

    if (search && typeof search === "string" && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: sanitized, $options: "i" } },
        { description: { $regex: sanitized, $options: "i" } },
      ];

      // Atomic increment or insert for search analytics
      await TopSearch.findOneAndUpdate(
        { data: search.trim() },
        { $inc: { number: 1 } },
        { upsert: true, new: true }
      );
    }

    const sort = {};
    if (rating) sort.rating = rating === "up" ? 1 : -1;
    if (price) sort.price = price === "up" ? 1 : -1;
    if (discount) sort.discount = discount === "up" ? 1 : -1;
    if (popular) {
      sort.rating = -1;
      sort.sold = -1;
    }

    const total = await Product.countDocuments(query);
    const list = await Product.find(query)
      .sort(sort)
      .skip(skip * limit)
      .limit(limit)
      .exec();

    return res.status(200).json({
      total,
      page: skip + 1,
      limit,
      count: list.length,
      list,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || req.body.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allCategories = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    const projection = params.name ? { name: 1, imagePath: 1, _id: 0 } : {};
    const list = await Category.find({}, projection);

    return res.status(200).json({ count: list.length, list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allBrands = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    const projection = params.name ? { name: 1, imagePath: 1, _id: 0 } : {};
    const list = await Brand.find({}, projection);

    return res.status(200).json({ count: list.length, list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allTopSearch = async (req, res) => {
  try {
    const list = await TopSearch.find().sort({ number: -1 }).limit(10).exec();
    return res.status(200).json({ count: list.length, list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allBanners = async (req, res) => {
  try {
    const dbBanners = await Banner.find();
    if (dbBanners.length > 0) {
      return res.status(200).json({
        count: dbBanners.length,
        list: dbBanners.map((b) => b.imagePath || b.name),
      });
    }

    const directoryPath = path.join(__dirname, "../../images/banners");
    if (!fsSync.existsSync(directoryPath)) {
      return res.status(200).json({ count: 0, list: [] });
    }

    const files = await fs.readdir(directoryPath);
    const list = files.map((file) => `${url}/images/banners/${file}`);

    return res.status(200).json({ count: list.length, list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  allProducts,
  getProductById,
  allBrands,
  allCategories,
  allBanners,
  allTopSearch,
};
