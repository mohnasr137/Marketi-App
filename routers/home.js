// packages
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

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

// routers
homeRouter.get("/products", allProducts);
homeRouter.get("/categories", allCategories);
homeRouter.get("/brands", allBrands);
homeRouter.get("/topSearch", allTopSearch);
homeRouter.post("/addProduct", upload.array("files", 5), addProduct);
homeRouter.put("/editProduct", upload.array("files", 5), editProduct);
homeRouter.delete("/deleteProduct", deleteProduct);

module.exports = homeRouter;
