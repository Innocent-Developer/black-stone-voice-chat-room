const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Start Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
    session: true,
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

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "✅ Google login successful",
        user: payload,
        token, // <-- Send token separately, not inside user object
      });
      
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// Optional fail route
router.get("/failed", (req, res) => {
  res.status(401).send("❌ Google login failed");
});

module.exports = router;
