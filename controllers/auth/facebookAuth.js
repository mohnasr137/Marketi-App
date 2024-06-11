const passport = require("passport");
const FacebookStrategy = require("passport-facebook");
const facebookUser = require("../../models/facebookUser");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  googleUser.findById({ facebookID: id }).then((user) => {
    done(null, user);
  });
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/oAuth/facebook/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
      const existingUser = await facebookUser.findOne({
        facebookID: profile.id,
      });
      if (!existingUser) {
        let user = new facebookUser({
          name: profile.displayName,
          facebookID: profile.id,
        });
        user = await user.save();
        done(null, user);
      } else {
        done(null, existingUser);
      }
    }
  )
);
