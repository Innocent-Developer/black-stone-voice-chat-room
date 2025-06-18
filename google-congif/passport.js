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

          // ✅ Generate JWT for existing user
          const token = jwt.sign(
            {
              id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              userName: existingUser.userName,
              ui_id: existingUser.ui_id,
              isVerified: existingUser.isVerified,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          existingUser.token = token; // ✅ Attach token
          return done(null, existingUser);
        }

        const newUser = new AccountCreate({
          name: profile.displayName,
          email: profile.emails[0].value,
          userName: profile.displayName,
          password: profile.id,
          isVerified: true,
          phoneNumber: `google-${profile.id}`,
          ui_id: await generateUniqueUIID(),
        });

        await newUser.save();
        console.log("✅ New user created");

        // ✅ Generate JWT for new user
        const token = jwt.sign(
          {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            userName: newUser.userName,
            ui_id: newUser.ui_id,
            isVerified: newUser.isVerified,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        done(null, newUser);
      } catch (err) {
        console.error("❌ Google OAuth error:", err);
        done(err, null);
      }
    }
  )
);
