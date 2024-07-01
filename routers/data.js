// packages
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const faker = require("faker");
const fs = require("fs").promises;
const path = require("path");

// imports
const User = require("../models/user");
const Product = require("../models/product");
const Image = require("../models/image");
const Brand = require("../models/brand");
const Category = require("../models/category");

const dataRouter = express.Router();
const url = process.env.API_URL;

const generateRandomImageUrl = () => {
  const width = 640;
  const height = 480;
  const uniqueParam = `?random=${Date.now()}`;
  return `https://picsum.photos/${width}/${height}${uniqueParam}`;
};

const generateFakeProduct = async (count) => {
  const brands = await Brand.find({}, "name");
  const categories = await Category.find({}, "name");
  const brandNames = brands.map((brand) => brand.name);
  const categoryNames = categories.map((category) => category.name);
  for (i = 0; i < count; i++) {
    const randomBrand = Math.floor(Math.random() * brandNames.length);
    const randomCategory = Math.floor(Math.random() * categoryNames.length);
    const product = new Product({
      title: faker.commerce.productName(),
      price: faker.commerce.price(),
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
};

async function storeImages() {
  try {
    const directoryPath = path.join(__dirname, "../views/categories");
    console.log(directoryPath);
    const files = await fs.readdir(directoryPath);
    console.log(files);
    for (const file of files) {
      const imagePath = path.join(`${url}/images/categories`, file);
      //const imageBuffer = await fs.readFile(imagePath);
      const { name } = path.parse(file);
      const newBrand = new Category({
        name: name,
        imagePath: imagePath,
      });
      await newBrand.save();
    }
    console.log("saved successfully");
  } catch (err) {
    console.error("Error storing:", err);
  }
}

dataRouter.get("/gen", async (req, res) => {
  //await generateFakeProduct(100);
  await storeImages();
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
  const brands = await Brand.find({}, {name:1,_id:0});
  const brandNames = brands.map((brand) => brand.name);
  const randomBrand = Math.floor(Math.random() * brandNames.length);
  res.json({brands})
});

module.exports = dataRouter;
