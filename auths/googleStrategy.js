const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const AccountCreate = require("../schema/account-create");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://www.blackstonevoicechatroom.online/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await AccountCreate.findOne({ email });

        if (!user) {
          user = new AccountCreate({
            name: profile.displayName,
            email,
            userName: profile.id,
            avatarUrl: profile.photos[0].value,
            isVerified: true,
            password: null, // optional
          });

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await AccountCreate.findById(id);
  done(null, user);
});
