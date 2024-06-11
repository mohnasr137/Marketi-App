// packages
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieSession = require("cookie-session");
const session = require("express-session");
const connectMongo = require("connect-mongo");

// imports
const authRouter = require("./routers/auth");
const homeRouter = require("./routers/home");
const authJwt = require("./middlewares/jwt");
const passportGoogleSetup = require("./controllers/auth/googleAuth");
const passportFacebookSetup = require("./controllers/auth/facebookAuth");

// init
const app = express();
const port = process.env.PORT;
const url = process.env.API_URL;

// middlewares
app.use(express.json());
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

// routers
app.use(`${url}/auth`, authRouter);
app.use(`${url}/home`, homeRouter);
app.use(`${url}/test`, (req, res) => {
  res.send("hi from test:- jwt is working and api is secured");
});
app.use(`${url}/:error`, (req, res) => {
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
app.listen(port, () => {
  console.log(`servr is listen on http://localhost:${port}`);
});
