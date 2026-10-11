const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const FacebookUser = require("../../models/facebookUser");

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "/api/v1"}/auth/oAuth/facebook/redirect`,
        profileFields: ["id", "displayName", "photos", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await FacebookUser.findOne({ facebookID: profile.id });
          if (!user) {
            user = new FacebookUser({
              name: profile.displayName || "Facebook User",
              facebookID: profile.id,
              email: profile.emails?.[0]?.value || "",
              verify: true,
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;
