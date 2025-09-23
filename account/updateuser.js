const AccountCreate = require("../schema/account-create");

const updateUser = async (req, res) => {
  try {
    const { id, updateDataForm } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!updateDataForm || Object.keys(updateDataForm).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }

    // Validate numeric fields
    if (updateDataForm.gold) {
      updateDataForm.gold = Number(updateDataForm.gold);
    }
    if (updateDataForm.diamond) {
      updateDataForm.diamond = Number(updateDataForm.diamond);
    }

    // Find user by ID and update
    const updatedUser = await AccountCreate.findByIdAndUpdate(
      id,
      { $set: updateDataForm },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      message: "Server error.",
      error: error.message 
    });
  }
};

module.exports = updateUser;