const AccountCreate = require("../schema/account-create");

const updateUser = async (req, res) => {
  try {
    const { id, name, userName, avatarUrl , gold,ui_id,updateDataForm } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Build update object only with provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (userName !== undefined) updateData.userName = userName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (gold !== undefined)updateData.gold = gold;
    if (ui_id !== undefined)updateData.ui_id = ui_id;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }
      if(updateDataForm){
        Object.keys(updateDataForm).forEach(key => {
          if (updateDataForm[key] !== undefined) {
            updateData[key] = updateDataForm[key];
          }
        });
      }

    // Find user by ID and update
    const updatedUser = await AccountCreate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // ensure schema validation applies
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
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = updateUser;
