const AccountCreate = require("../schema/account-create.js");

const completeProfile = async (req, res) => {
  try {
    const { email, userName, gender, country, avatarUrl } = req.body;

    if (!email || !userName) {
      return res.status(400).json({ message: "email and userName are required" });
    }

    // Check for existing user from Google OAuth
    const user = await AccountCreate.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign in with Google first." });
    }

    // Prevent updating userName if already set
    if (user.userName) {
      return res.status(409).json({ message: "userName already set. Profile already completed." });
    }

    // Update additional profile fields
    user.userName = userName;
    user.gender = gender || user.gender;
    user.country = country || user.country;
    user.avatarUrl = avatarUrl || user.avatarUrl;

    await user.save();

    res.status(200).json({ message: "Profile completed successfully", user });
  } catch (error) {
    console.error("Complete profile error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = completeProfile;
