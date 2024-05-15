const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const faker = require("faker");
const Product = require("../models/product");
const Image = require("../models/image");
const fs = require("fs");

const homeRouter = express.Router();

// const axios = require("axios");

// const generateProductImages = async (category) => {
//   const apiKey = "i5_77HCh_u9J-Ep67cbbvilpkM2c6l90kHZItj9p1_o";
//   const apiUrl = `https://api.unsplash.com/photos/random?query=${category}&client_id=${apiKey}`;
//   try {
//     const response = await axios.get(apiUrl);
//     return response;
//   } catch (error) {
//     console.error("Error fetching product images:", error);
//   }
// };

const generateRandomImageUrl = () => {
  const width = 640;
  const height = 480;
  const uniqueParam = `?random=${Date.now()}`;
  return `https://picsum.photos/${width}/${height}${uniqueParam}`;
};

const generateFakeProduct = async (count) => {
  for (i = 0; i < count; i++) {
    let product = new Product({
      id: faker.commerce.id,
      title: faker.commerce.productName(),
      price: faker.commerce.price(),
      description: faker.lorem.paragraph(),
      image: generateRandomImageUrl(),
      rating: faker.datatype.number({ min: 1, max: 5 }),
    });
    await product.save();
  }
};

homeRouter.get("/start", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "no token" });
  }
  const isVerify = jwt.verify(token, process.env.SECRET);
  if (!isVerify) {
    return res.status(400).json({ message: "not verify" });
  }
  const existingUser = await User.findById(isVerify.id);
  if (!existingUser) {
    return res
      .status(400)
      .json({ message: "the user with this email not found!" });
  }
  const randomProducts = await Product.aggregate([{ $sample: { size: 10 } }]);
  const email = existingUser.email;
  const image = await Image.findOne({ userEmail: email });
  const base64Image = Buffer.from(image.data).toString("base64");
  console.log(image.data);
  console.log(base64Image);
  res.json({
    name: existingUser.name,
    image: base64Image,
    statusCode: 200,
    status: true,
    products: randomProducts,
  });
});

homeRouter.get("/generate", async (req, res) => {
  await generateFakeProduct(100);
  res.send(`product generated..`);
});

module.exports = homeRouter;
