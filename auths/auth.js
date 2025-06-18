const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken"); // Add this
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
  (req, res) => {
    // ✅ Send selected user fields in response (safe for frontend)
    if (req.user) {
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
      const token = jwt.sign(
        {
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
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
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
      token,
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
      res.send({
        message: "✅ Google login successful",
        user: {
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
        },
        encodedUser: encoded, // Send encoded user data
      });
    } else {
      res.status(400).send({ message: "❌ User not found in request" });
    }
  }
);

// Optional fail route
router.get("/failed", (req, res) => {
  res.status(401).send("❌ Google login failed");
});

module.exports = router;
