const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AccountCreate = require("../models/AccountCreate");

passport.serializeUser((user, done) => {
  done(null, user.id); // store MongoDB _id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await AccountCreate.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://www.blackstonevoicechatroom.online/auth/google/callback", // must match in Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await AccountCreate.findOne({ email: profile.emails[0].value });

        if (existingUser) return done(null, existingUser);

        const newUser = new AccountCreate({
          name: profile.displayName,
          email: profile.emails[0].value,
          userName: profile.id,
          password: profile.id, // OR generate a random one if needed
          isVerified: true,
          avatarUrl: profile.photos[0]?.value,
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
