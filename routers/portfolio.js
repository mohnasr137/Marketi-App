// packages
import express from "express";
import multer from "multer";
import path from "path";

// imports
import {
  addImage,
  userData,
  editUserData,
} from "../controllers/home/portfolio.js";

// init
const portfolioRouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/portfolio/");
  },
  filename: (req, file, cb) => {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + code + ext);
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
portfolioRouter.post("/addImage", upload.single("file"), addImage);
portfolioRouter.get("/userData", userData);
portfolioRouter.post("/editUserData", editUserData);

// exports
export default portfolioRouter;
