// packages
const express = require("express");
const multer = require("multer");
const path = require("path");
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
  getBuyAgain,
  // checkout,
} = require("../controllers/home/bacicUser");

// init
const userRouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/uploads/");
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
userRouter.get("/getBuyAgain", getBuyAgain);
// userRouter.post("/checkout", checkout);

// userRouter.get("/complete", async (req, res) => {
//   const session = await stripe.checkout.sessions.retrieve(
//     req.query.session_id,
//     {
//       expand: ["payment_intent.payment_method"],
//     }
//   );

//   console.log(JSON.stringify(session));
//   res.send("Your payment was successful");
// });

// userRouter.get("/cancel", (req, res) => {
//   res.redirect("/");
// });

module.exports = userRouter;
