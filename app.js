// packages
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
const session = require("express-session");
const connectMongo = require("connect-mongo");

// imports
const authRouter = require("./routers/auth");
const homeRouter = require("./routers/home");
const userRouter = require("./routers/user");
const portfoiloRouter = require("./routers/portfolio");
const dataRouter = require("./routers/data");
const authJwt = require("./middlewares/jwt");
const topSearch = require("./middlewares/topSearch");
const passportGoogleSetup = require("./controllers/auth/googleAuth");
const passportFacebookSetup = require("./controllers/auth/facebookAuth");

// init
const app = express();
const port = process.env.PORT;
const url = process.env.API_URL;

// middlewares
app.use(cors());
app.options("*", cors());
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(`${url}/images`, express.static(path.join(__dirname, "images")));
app.use(`${url}/uploads`, express.static(path.join(__dirname, "uploads")));
// app.use(
//   `${url}/images/brands`,
//   express.static(path.join(__dirname, "views", "brands"))
// );
// app.use(
//   `${url}/images/categories`,
//   express.static(path.join(__dirname, "views", "categories"))
// );
// app.use(
//   `${url}/images/portfoilo`,
//   express.static(path.join(__dirname, "views", "portfoilo"))
// );
// app.use(
//   session({
//     secret: process.env.COOKIE_KEYS,
//     maxAge: 24 * 60 * 60 * 1000,
//     store: connectMongo.create({
//       mongoUrl: process.env.CONNECTION_STRING,
//     }),
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true },
//   })
// );
// app.use(
//   cookieSession({
//     maxAge: 24 * 60 * 60 * 1000,
//     keys: [process.env.COOKIE_KEYS],
//   })
// );
// app.use(function (request, response, next) {
//   if (request.session && !request.session.regenerate) {
//     request.session.regenerate = (cb) => {
//       cb();
//     };
//   }
//   if (request.session && !request.session.save) {
//     request.session.save = (cb) => {
//       cb();
//     };
//   }
//   next();
// });
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(authJwt);
app.use(topSearch);

// routers
app.use(`${url}/auth`, authRouter);
app.use(`${url}/home`, homeRouter);
app.use(`${url}/user`, userRouter);
app.use(`${url}/portfoilo`, portfoiloRouter);
app.use(`${url}/data`, dataRouter);
app.use(`/:error`, (req, res) => {
  const { error } = req.params;
  res.send(`hi from error:- you write ${error} and there is no api like this`);
});

// connection
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("mongoose connection successfully");
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(port, console.log(`server is listen on http://localhost:${port}`));
