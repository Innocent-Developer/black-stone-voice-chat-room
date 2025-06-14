const AccountCreate = require("../schema/account-create");

const deleteUser = async (req, res) => {
  try {
    const { ui_id } = req.body; // Destructure ui_id from the body

    // Validate UI ID
    if (ui_id === undefined || typeof ui_id !== "number") {
      return res
        .status(400)
        .json({ message: "Invalid UI ID provided. It must be a number." });
    }

    // Find and delete the user by numeric ui_id
    const deletedUser = await AccountCreate.findOneAndDelete({ ui_id: ui_id });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
    console.log(deleteUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = deleteUser;
