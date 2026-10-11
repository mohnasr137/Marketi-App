const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GoogleUser = require("../../models/googleUser");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "/api/v1"}/auth/oAuth/google/redirect`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await GoogleUser.findOne({ googleID: profile.id });
          if (!user) {
            user = new GoogleUser({
              name: profile.displayName || "Google User",
              googleID: profile.id,
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
