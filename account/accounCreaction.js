const AccountCreate = require("../schema/account-create.js");

const completeUserProfile = async (req, res) => {
  try {
    const { email, userName, gender, country, avatarUrl } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await AccountCreate.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new userName is already taken by another user
    if (userName && userName !== user.userName) {
      const userNameTaken = await AccountCreate.findOne({ userName });
      if (userNameTaken && userNameTaken.email !== email) {
        return res.status(409).json({ message: "Username already taken" });
      }
      user.userName = userName;
    }

    // Update other fields
    if (gender) user.gender = gender;
    if (country) user.country = country;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", data: user });

  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = completeUserProfile;
