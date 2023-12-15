//packages
const express = require("express");
const mongoose = require("mongoose");

//other files
const authRouter = require("./routers/auth");

//init
const app = express();
const PORT = process.env.PORT || 3000;
const DB =
  "mongodb+srv://mohNasr:Moh01093669048@cluster0.ovgomdp.mongodb.net/?retryWrites=true&w=majority";

//middlewares
app.use(express.json());
app.use("/auth", authRouter);
app.use("/", (req, res) => {
  res.send("hi, from ecommerce");
});

//connection
mongoose
  .connect(DB)
  .then(() => {
    console.log("mongoose connection successfully");
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(PORT, () => {
  console.log(`servr is listen on http://localhost:${PORT}`);
});
