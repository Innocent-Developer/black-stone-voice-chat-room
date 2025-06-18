const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AccountCreate = require("../schema/account-create");
const dotenv = require("dotenv");
const generateUniqueUIID = require("../utils/generateUniqueUIID");
const jwt = require("jsonwebtoken");
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

          const token = jwt.sign(
            {
              _id: existingUser._id,
              name: existingUser.name,
              userName: existingUser.userName,
              email: existingUser.email,
              isVerified: existingUser.isVerified,
              ui_id: existingUser.ui_id,
              followers: existingUser.followers || [],
              following: existingUser.following || [],
              gold: existingUser.gold || 0,
              diamond: existingUser.diamond || 0,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          existingUser.token = token;
          return done(null, existingUser);
        }

        // Create new user
        const newUser = new AccountCreate({
          name: profile.displayName,
          email: profile.emails[0].value,
          userName: profile.id,
          password: profile.id,
          isVerified: true,
          phoneNumber: `google-${profile.id}`,
          ui_id: await generateUniqueUIID(),
          followers: [],
          following: [],
          gold: 0,
          diamond: 0,
        });

        await newUser.save();
        console.log("✅ New user created");

        const token = jwt.sign(
          {
            _id: newUser._id,
            name: newUser.name,
            userName: newUser.userName,
            email: newUser.email,
            isVerified: newUser.isVerified,
            ui_id: newUser.ui_id,
            followers: [],
            following: [],
            gold: 0,
            diamond: 0,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        newUser.token = token;
        done(null, newUser);
      } catch (err) {
        console.error("❌ Google OAuth error:", err);
        done(err, null);
      }
    }
  )
);
