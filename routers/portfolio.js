const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  addImage,
  userData,
  editUserData,
} = require("../controllers/home/portfolio.js");

const portfolioRouter = express.Router();

// Ensure portfolio uploads directory exists
const portfolioDir = path.join(__dirname, "../images/portfolio");
if (!fs.existsSync(portfolioDir)) {
  fs.mkdirSync(portfolioDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/portfolio/");
  },
  filename: (req, file, cb) => {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${code}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type: Only images are allowed"));
    }
  },
});

// Profile endpoints
portfolioRouter.post("/addImage", upload.single("file"), addImage);
portfolioRouter.get("/userData", userData);
portfolioRouter.post("/editUserData", editUserData);
portfolioRouter.put("/editUserData", editUserData);

module.exports = portfolioRouter;
