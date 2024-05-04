const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const faker = require("faker");
const Product = require("../models/product");
const homeRouter = express.Router();

const generateFakeProduct = async (count) => {
  for (i = 0; i < count; i++) {
    let product = new Product({
      id: faker.commerce.id,
      title: faker.commerce.productName(),
      price: faker.commerce.price(),
      description: faker.lorem.paragraph(),
      image: faker.image.imageUrl(),
      rating: faker.random.number({ min: 1, max: 5 }),
    });
    await product.save();
  }
};

homeRouter.get("/start", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "no token" });
  }
  console.log(token);
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
  console.log(existingUser);
  const randomProducts = await Product.aggregate([{ $sample: { size: 10 } }]);
  res.json({
    name: existingUser.name,
    statusCode: 200,
    status: true,
    products: randomProducts,
  });
});

homeRouter.get("/generate", async (req, res) => {
  generateFakeProduct(90);
  res.send(`product generated..`);
});

module.exports = homeRouter;
