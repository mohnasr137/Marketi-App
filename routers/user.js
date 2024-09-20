// packages
const express = require("express");
const multer = require("multer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// imports
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
  addImage,
  getBuyAgain,
  checkout,
} = require("../controllers/home/bacicUser");

// init
const userRouter = express.Router();
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
userRouter.post("/addProduct", upload.array("files", 5), addProduct);
userRouter.put("/editProduct", upload.array("files", 5), editProduct);
userRouter.delete("/deleteProduct", deleteProduct);
userRouter.get("/getCart", getCart);
userRouter.get("/getFavorite", getFavorite);
userRouter.post("/addCart", addCart);
userRouter.post("/addFavorite", addFavorite);
userRouter.delete("/deleteCart", deleteCart);
userRouter.delete("/deleteFavorite", deleteFavorite);
userRouter.post("/addRate", addRate);
userRouter.post("/addImage", upload.single("file"), addImage);
userRouter.get("/getBuyAgain", getBuyAgain);
userRouter.post("/checkout", checkout);

userRouter.get("/complete", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(
    req.query.session_id,
    {
      expand: ["payment_intent.payment_method"],
    }
  );

  console.log(JSON.stringify(session));
  res.send("Your payment was successful");
});

userRouter.get("/cancel", (req, res) => {
  res.redirect("/");
});

module.exports = userRouter;
