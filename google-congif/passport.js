const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const AccountCreate = require("../schema/account-create");
const generateUniqueUIID = require("../utils/generateUniqueUIID");

dotenv.config();

// Register Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://www.blackstonevoicechatroom.online/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || "Unnamed User";
        const googleId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error("Google account email not found."), null);
        }

        // Find existing user
        let user = await AccountCreate.findOne({ email });

        if (!user) {
          // Create new user
          user = new AccountCreate({
            name,
            email,
            userName: googleId,
            avatarUrl: avatarUrl || null,
            isVerified: true,
            password: null, // Google users don't have a password
            phoneNumber: `google-${googleId}`,
            ui_id: await generateUniqueUIID(),
          });

          await user.save();
          console.log("✅ New user created via Google");
        } else {
          console.log("✅ Existing user authenticated via Google");
        }

        // Attach JWT token to the user
        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
            userName: user.userName,
            ui_id: user.ui_id,
            isVerified: user.isVerified,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        user.token = token; // Add token to the user object (can be used in redirect or response)

        return done(null, user);
      } catch (error) {
        console.error("❌ Error in GoogleStrategy:", error);
        return done(error, null);
      }
    }
  )
);

// Session support (optional, only if you're using session-based auth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await AccountCreate.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
