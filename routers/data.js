const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
const faker = require("faker");

const Product = require("../models/product");
const Brand = require("../models/brand");
const Category = require("../models/category");
const Banner = require("../models/banner");

const dataRouter = express.Router();
const url = process.env.API_URL || "/api/v1";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const generateRandomImageUrl = () => {
  const width = 640;
  const height = 480;
  const uniqueParam = `?random=${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return `https://picsum.photos/${width}/${height}${uniqueParam}`;
};

const generateFakeProduct = async (count = 10) => {
  try {
    const brands = await Brand.find({}, "name");
    const categories = await Category.find({}, "name");

    const brandNames =
      brands.length > 0
        ? brands.map((b) => b.name)
        : ["Apple", "Samsung", "Sony", "Nike", "Adidas", "Canon"];

    const categoryNames =
      categories.length > 0
        ? categories.map((c) => c.name)
        : ["Electronics", "Fashion", "Home & Kitchen", "Sports", "Books"];

    const productsToInsert = [];

    for (let i = 0; i < count; i++) {
      const randomBrand = brandNames[Math.floor(Math.random() * brandNames.length)];
      const randomCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];

      productsToInsert.push({
        title: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        description: faker.lorem.paragraph(),
        images: [generateRandomImageUrl()],
        rating: faker.datatype.number({ min: 1, max: 5 }),
        location: {
          name: faker.address.city(),
          location: {
            type: "Point",
            coordinates: [
              parseFloat(faker.address.longitude()),
              parseFloat(faker.address.latitude()),
            ],
          },
        },
        discount: faker.datatype.number({ min: 0, max: 50 }),
        remain: faker.datatype.number({ min: 1, max: 100 }),
        sold: faker.datatype.number({ min: 0, max: 500 }),
        brand: randomBrand,
        category: randomCategory,
      });
    }

    await Product.insertMany(productsToInsert);
    console.log(`${count} fake products generated successfully.`);
    return count;
  } catch (error) {
    console.error("Error generating fake products:", error);
    throw error;
  }
};

dataRouter.post("/createProduct", upload.array("files", 5), async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      rating,
      discount,
      remain,
      sold,
      brand,
      category,
    } = req.body;

    const images =
      req.files && req.files.length > 0
        ? req.files.map((obj) => obj.path.replace(/\\/g, "/"))
        : [generateRandomImageUrl()];

    const product = new Product({
      title: title || "Sample Product",
      price: parseFloat(price) || 29.99,
      description: description || "Sample product description",
      images,
      rating: parseFloat(rating) || 4.5,
      location: {
        name: "Egypt",
        location: {
          type: "Point",
          coordinates: [31.2357, 30.0444],
        },
      },
      discount: parseFloat(discount) || 0,
      remain: parseInt(remain, 10) || 50,
      sold: parseInt(sold, 10) || 0,
      brand: brand || "Generic",
      category: category || "General",
    });

    await product.save();
    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

dataRouter.get("/gen", async (req, res) => {
  try {
    const count = Math.min(100, parseInt(req.query.count, 10) || 10);
    await generateFakeProduct(count);
    return res.status(200).json({ message: `${count} fake products generated successfully.` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

dataRouter.get("/start", async (req, res) => {
  try {
    const randomProducts = await Product.aggregate([{ $sample: { size: 10 } }]);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      products: randomProducts,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

dataRouter.get("/image", async (req, res) => {
  try {
    const imagePath = path.join(__dirname, "../images/portfolio/simple.jpg");
    const data = await fs.readFile(imagePath);
    const base64String = data.toString("base64");
    return res.status(200).json({
      base64: base64String,
      contentType: "image/jpeg",
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to read default avatar image file" });
  }
});

dataRouter.get("/test", async (req, res) => {
  try {
    const brands = await Brand.find({}, { name: 1, _id: 0 });
    return res.status(200).json({ brands });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = dataRouter;
