// packages
const express = require("express");
const mongoose = require("mongoose");

// imports
const {
  allProducts,
  allBrands,
  allCategories,
  allTopSearch,
} = require("../controllers/home/show");
const {
  addProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/home/bacicHome");

// init
const homeRouter = express.Router();

// routers
homeRouter.get("/products", allProducts);
homeRouter.get("/categories", allCategories);
homeRouter.get("/brands", allBrands);
homeRouter.get("/topSearch", allTopSearch);
homeRouter.post("/add", addProduct);
homeRouter.put("/edit", editProduct);
homeRouter.delete("/delete", deleteProduct);

module.exports = homeRouter;
