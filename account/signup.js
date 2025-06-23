const AccountCreate = require("../schema/account-create.js");

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { userName, gender, country, image } = req.body;

    // Validate required fields
    if (!userName || !gender || !country) {
      return res.status(400).json({ message: "userName, gender, and country are required." });
    }

    // Find user by ID
    const user = await AccountCreate.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update allowed fields
    user.userName = userName;
    user.gender = gender;
    user.country = country;

    // Optional field
    if (image) {
      user.avatarUrl = image;
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully.",
      user: {
        id: user._id,
        userName: user.userName,
        gender: user.gender,
        country: user.country,
        image: user.avatarUrl || null,
      },
    });
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = updateProfile;
