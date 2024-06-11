const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const googleUser = require("../../models/googleUser");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id,done)=>{
  googleUser.findById({googleID:id}).then((user)=>{
    done(null,user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/oAuth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
      const existingUser = await googleUser.findOne({ googleID: profile.id });
      if (!existingUser) {
        let user = new googleUser({
          name: profile.displayName,
          googleID: profile.id,
        });
        user = await user.save();
        done(null, user);
      } else {
        done(null, existingUser);
      }
    }
  )
);
