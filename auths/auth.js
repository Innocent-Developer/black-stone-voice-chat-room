const express = require("express");
const passport = require("passport");
const router = express.Router();

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
    // Send a success response
    res.send("✅ Google login successful");
    // OR redirect to a frontend page if you have one in future
    // res.redirect("https://yourfrontend.com/dashboard");
  }
);

// Optional fail route
router.get("/failed", (req, res) => {
  res.status(401).send("❌ Google login failed");
});

module.exports = router;
