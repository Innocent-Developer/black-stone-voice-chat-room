const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AccountCreate = require("../schema/account-create");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required." });
    }

    const user = await AccountCreate.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1h" }
    );

    // Optional: sanitize user data before sending it
    const { password: pwd, ...userData } = user.toObject();

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
