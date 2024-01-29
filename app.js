//packages
const express = require("express");
const mongoose = require("mongoose");

//routers
const authRouter = require("./routers/auth");
const authJwt = require("./middlewares/jwt");

//init
const app = express();
const port = process.env.PORT;
const url = process.env.API_URL;

//middlewares
app.use(express.json());
app.use(authJwt);

app.use(`${url}/auth`, authRouter);
app.use(`${url}/can`, (req, res) => {
  res.send("jwt is working and api is secured");
});

//connection
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("mongoose connection successfully");
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(port, () => {
  console.log(`servr is listen on http://localhost:${port}`);
});
