const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  addProduct,
  editProduct,
  deleteProduct,
  getCart,
  getFavorite,
  addCart,
  addFavorite,
  deleteCart,
  deleteFavorite,
  addRate,
  getBuyAgain,
  checkout,
} = require("../controllers/home/basicUser");

const userRouter = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../images/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/uploads/");
  },
  filename: (req, file, cb) => {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${code}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type: Only images are allowed"));
    }
  },
});

// Product Management
userRouter.post("/addProduct", upload.array("files", 5), addProduct);
userRouter.put("/editProduct/:productId?", upload.array("files", 5), editProduct);
userRouter.delete("/deleteProduct/:productId?", deleteProduct);

// Cart Endpoints
userRouter.get("/getCart", getCart);
userRouter.post("/addCart", addCart);
userRouter.delete("/deleteCart/:productId?", deleteCart);

// Favorites Endpoints
userRouter.get("/getFavorite", getFavorite);
userRouter.post("/addFavorite", addFavorite);
userRouter.delete("/deleteFavorite/:productId?", deleteFavorite);

// Ratings & History
userRouter.post("/addRate", addRate);
userRouter.get("/getBuyAgain", getBuyAgain);

// Payments & Checkout
userRouter.post("/checkout", checkout);
userRouter.get("/complete", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Your payment was successful",
    sessionId: req.query.session_id,
  });
});
userRouter.get("/cancel", (req, res) => {
  res.status(200).json({
    status: false,
    message: "Checkout was cancelled",
  });
});

module.exports = userRouter;
