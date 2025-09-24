const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AccountCreate = require("../schema/account-create");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user
    const user = await AccountCreate.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    let isMatch = false;

    // Try bcrypt comparison
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      isMatch = false;
    }

    // Fallback to plain text if not a bcrypt hash
    if (!isMatch) {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id,username: user.username, email: user.email , role: user.role},
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1h" }
    );

    // Exclude password before sending user data
    const { password: pwd, ...userData } = user.toObject();

    // Send response
    res.status(200).json({
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = login;
