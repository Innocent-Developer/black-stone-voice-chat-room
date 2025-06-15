const AccountCreate = require("../schema/account-create");

const saveDeviceToken = async (req, res) => {
  try {
    const { ui_id, deviceToken } = req.body;

    if (!ui_id || !deviceToken) {
      return res.status(400).json({ message: "userId and deviceToken are required" });
    }

    const user = await AccountCreate.findOneAndUpdate(
      { ui_id: ui_id },
      { deviceToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Device token saved successfully", user });
  } catch (error) {
    console.error("Error saving device token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = saveDeviceToken;
