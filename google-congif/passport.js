const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AccountCreate = require("../schema/account-create");
const dotenv = require("dotenv");
dotenv.config();
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
      callbackURL:
        "https://www.blackstonevoicechatroom.online/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ Google profile received:", profile);

        const existingUser = await AccountCreate.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          console.log("✅ User found in DB");
          return done(null, existingUser);
        }

        const newUser = new AccountCreate({
          name: profile.displayName,
          email: profile.emails[0].value,
          userName: profile.id,
          password: profile.id,
          isVerified: true,
          avatarUrl: profile.photos[0]?.value,
        });

        await newUser.save();
        console.log("✅ New user created");
        done(null, newUser);
      } catch (err) {
        console.error("❌ Google OAuth error:", err);
        done(err, null);
      }
    }
  )
);

