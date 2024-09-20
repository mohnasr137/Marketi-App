// packages
const express = require("express");

// imports
const {
  allProducts,
  allBrands,
  allBanners,
  allCategories,
  allTopSearch,
} = require("../controllers/home/show");

// init
const homeRouter = express.Router();

// routers
homeRouter.get("/products", allProducts);
homeRouter.get("/categories", allCategories);
homeRouter.get("/brands", allBrands);
homeRouter.get("/banners", allBanners);
homeRouter.get("/topSearch", allTopSearch);

module.exports = homeRouter;
