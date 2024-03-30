//packages
const express = require("express");
const mongoose = require("mongoose");

//routers
const authRouter = require("./routers/auth");
const authJwt = require("./middlewares/jwt");
const passportGoogleSetup = require("./controllers/googleAuth");
const passportFacebookSetup = require("./controllers/facebookAuth");
const passport = require("passport");
const cookieSession = require("cookie-session");
const session = require("express-session");
const connectMongo = require("connect-mongo")
//init
const app = express();
const port = process.env.PORT;
const url = process.env.API_URL;

//middlewares
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_KEYS,
    store: connectMongo.create({
      mongoUrl: process.env.CONNECTION_STRING,
    }),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

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
app.use(passport.initialize());
app.use(passport.session());
// app.use(authJwt);

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
