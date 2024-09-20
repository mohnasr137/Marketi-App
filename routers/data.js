// packages
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const faker = require("faker");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");

// imports
const User = require("../models/user");
const Product = require("../models/product");
const Image = require("../models/image");
const Brand = require("../models/brand");
const Category = require("../models/category");
const Banner = require("../models/banner");

const dataRouter = express.Router();
const url = process.env.API_URL;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const generateRandomImageUrl = () => {
  const width = 640;
  const height = 480;
  const uniqueParam = `?random=${Date.now()}`;
  return `https://picsum.photos/${width}/${height}${uniqueParam}`;
};

// const generateFakeProduct = async (count) => {
//   const brands = await Brand.find({}, "name");
//   const categories = await Category.find({}, "name");
//   const brandNames = brands.map((brand) => brand.name);
//   const categoryNames = categories.map((category) => category.name);
//   for (i = 0; i < count; i++) {
//     const randomBrand = Math.floor(Math.random() * brandNames.length);
//     const randomCategory = Math.floor(Math.random() * categoryNames.length);
//     const product = new Product({
//       title: faker.commerce.productName(),
//       price: faker.commerce.price(),
//       description: faker.lorem.paragraph(),
//       images: [generateRandomImageUrl()],
//       rating: faker.datatype.number({ min: 1, max: 5 }),
//       location: {
//         name: faker.address.city(),
//         location: {
//           type: "Point",
//           coordinates: [
//             parseFloat(faker.address.longitude()),
//             parseFloat(faker.address.latitude()),
//           ],
//         },
//       },
//       discount: faker.datatype.number({ min: 0, max: 50 }),
//       remain: faker.datatype.number({ min: 1, max: 100 }),
//       sold: faker.datatype.number({ min: 0, max: 1000 }),
//       brand: brandNames[randomBrand],
//       category: categoryNames[randomCategory],
//     });
//     await product.save();
//   }
// };

const generateFakeProduct = async (count) => {
  try {
    const brands = await Brand.find({}, "name");
    const categories = await Category.find({}, "name");
    const brandNames = brands.map((brand) => brand.name);
    const categoryNames = categories.map((category) => category.name);

    for (let i = 0; i < count; i++) {
      const randomBrand = Math.floor(Math.random() * brandNames.length);
      const randomCategory = Math.floor(Math.random() * categoryNames.length);
      const product = new Product({
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
        sold: faker.datatype.number({ min: 0, max: 1000 }),
        brand: brandNames[randomBrand],
        category: categoryNames[randomCategory],
      });
      await product.save();
    }
    console.log(`${count} fake products generated and saved to the database.`);
  } catch (error) {
    console.error("Error generating fake products:", error);
  }
};

async function storeImages() {
  try {
    const directoryPath = path.join(__dirname, "../images/banners");
    console.log(directoryPath);
    const files = await fs.readdir(directoryPath);
    console.log(files);
    for (const file of files) {
      const imagePath = path.join(`${url}/images/banners`, file);
      //const imageBuffer = await fs.readFile(imagePath);
      const { name } = path.parse(file);
      const newBrand = new Banner({
        name: name,
        imagePath: "https://marketi.up.railway.app" + imagePath,
      });
      await newBrand.save();
    }
    console.log("saved successfully");
  } catch (err) {
    console.error("Error storing:", err);
  }
}

const productTest = async (count) => {
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
    const images = req.files;
    const product = new Product({
      title,
      price,
      description,
      images: [generateRandomImageUrl()],
      rating,
      location: {
        name: "Egypt",
        location: {
          type: "Point",
          coordinates: [0, 1],
        },
      },
      discount,
      remain,
      sold,
      brand,
      category,
    });
    await product.save();
    console.log(`${count} fake products generated and saved to the database.`);
  } catch (error) {
    console.error("Error generating fake products:", error);
  }
};

dataRouter.post(
  "/createProduct",
  upload.array("files", 5),
  async (req, res) => {
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
      const images = req.files.map(
        (obj) => "https://marketi-app.onrender.com\\api\\v1\\" + obj.path
      );
      const product = new Product({
        title,
        price,
        description,
        images,
        rating,
        location: {
          name: "Egypt",
          location: {
            type: "Point",
            coordinates: [0, 1],
          },
        },
        discount,
        remain,
        sold,
        brand,
        category,
      });
      await product.save();
      console.log(`fake products generated and saved to the database.`);
      res.send(`product generated..`);
    } catch (error) {
      console.error("Error generating fake products:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

dataRouter.get("/gen", async (req, res) => {
  // await generateFakeProduct(100);
  await productTest();
  res.send(`product generated..`);
});

dataRouter.get("/start", async (req, res) => {
  const randomProducts = await Product.aggregate([{ $sample: { size: 10 } }]);
  // const email = existingUser.email;
  // const image = await Image.findOne({ userEmail: email });
  // const base64Image = Buffer.from(image.data).toString("base64");
  // console.log(image.data);
  // console.log(base64Image);
  res.json({
    // name: existingUser.name,
    // image: base64Image,
    statusCode: 200,
    status: true,
    products: randomProducts,
  });
});

dataRouter.get("/image", async (req, res) => {
  try {
    console.log("here");
    const imagePath = path.join(__dirname, "../views/portoflio/simple.jpg");
    console.log(imagePath);
    const data = await fs.readFile(imagePath);
    console.log("here");
    const base64String = data.toString("base64");
    const offer = Buffer(data);
    console.log("here");
    res.json({ base64: base64String, offer: offer });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to read the image file" });
  }
});

dataRouter.get("/test", async (req, res) => {
  const brands = await Brand.find({}, { name: 1, _id: 0 });
  const brandNames = brands.map((brand) => brand.name);
  const randomBrand = Math.floor(Math.random() * brandNames.length);
  res.json({ brands });
});

module.exports = dataRouter;
