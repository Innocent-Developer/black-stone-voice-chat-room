const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// STEP 1: Start Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// STEP 2: Callback route after Google login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: false, // Disable session if using JWT-only auth
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const {
        _id,
        name,
        userName,
        email,
        isVerified,
        ui_id,
        followers,
        following,
        gold,
        diamond,
      } = req.user;

      const payload = {
        _id,
        name,
        userName,
        email,
        isVerified,
        ui_id,
        followers,
        following,
        gold,
        diamond,
      };

      // Generate JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // Redirect to frontend with token (optional)
      const redirectUrl = `https://blackstonevoicechatroom.online/login/success?token=${token}`;

      // Or respond with JSON (if using API-based approach)
      return res.status(200).json({
        message: "✅ Google login successful",
        user: payload,
        token,
      });

      // Uncomment below if using redirect instead of JSON:
      // return res.redirect(redirectUrl);

    } catch (error) {
      console.error("❌ Error during Google callback:", error);
      return res.status(500).json({ message: "Server error during login" });
    }
  }
);

// Optional failed login route
router.get("/failed", (req, res) => {
  res.status(401).send("❌ Google login failed");
});

module.exports = router;
