// Load environment variables first
require("dotenv").config();

// packages
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

// imports
const authRouter = require("./routers/auth");
const homeRouter = require("./routers/home");
const userRouter = require("./routers/user");
const portfolioRouter = require("./routers/portfolio");
const dataRouter = require("./routers/data");
const authJwt = require("./middlewares/jwt");
const topSearch = require("./middlewares/topSearch");

// init
const app = express();
const port = process.env.PORT || 3000;
const url = process.env.API_URL || "/api/v1";

// middlewares
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files serving
app.use(`${url}/uploads`, express.static(path.join(__dirname, "images", "uploads")));
app.use(`${url}/portfolio`, express.static(path.join(__dirname, "images", "portfolio")));
app.use(`${url}/images`, express.static(path.join(__dirname, "images")));

// security & tracking middlewares
app.use(authJwt);
app.use(topSearch);

// health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Market-i API",
    status: "online",
    documentation: `${url}/home/products`,
    version: "1.0.0",
  });
});

app.get(`${url}`, (req, res) => {
  res.status(200).json({
    name: "Market-i API",
    status: "online",
    version: "1.0.0",
  });
});

// routers
app.use(`${url}/auth`, authRouter);
app.use(`${url}/home`, homeRouter);
app.use(`${url}/user`, userRouter);
app.use(`${url}/portfolio`, portfolioRouter);
app.use(`${url}/portfoilo`, portfolioRouter); // backward compatibility alias
app.use(`${url}/data`, dataRouter);

// 404 handler for unmapped routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `There is no endpoint registered for ${req.method} ${req.originalUrl}`,
  });
});

// global centralized error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || "ServerError",
    message: err.message || "An unexpected error occurred",
  });
});

// database connection and server initialization
const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
  console.warn("WARNING: CONNECTION_STRING is not defined in .env!");
}

mongoose
  .connect(connectionString || "mongodb://localhost:27017/market-i")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });

app.listen(port, () => {
  console.log(`Market-i Server running on http://localhost:${port}${url}`);
});

module.exports = app;
