const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const AccountCreate = require("../schema/account-create.js"); // your model

// @route   POST /api/signup
// @desc    Register a new user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phoneNumber, address } = req.body;

    // Check if user already exists
    const existingUser = await AccountCreate.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new AccountCreate({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully." });

  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
