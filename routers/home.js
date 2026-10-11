const express = require("express");
const {
  allProducts,
  getProductById,
  allBrands,
  allBanners,
  allCategories,
  allTopSearch,
} = require("../controllers/home/show");

const homeRouter = express.Router();

// Catalog & Product Endpoints
homeRouter.get("/products", allProducts);
homeRouter.get("/products/:id", getProductById);
homeRouter.get("/categories", allCategories);
homeRouter.get("/brands", allBrands);
homeRouter.get("/banners", allBanners);
homeRouter.get("/topSearch", allTopSearch);

module.exports = homeRouter;
