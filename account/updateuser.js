const AccountCreate = require("../schema/account-create");

const updateUser = async (req, res) => {
    try {
        const { id, ...updateData } = req.body;

        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const updatedUser = await AccountCreate.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true } // returns the updated document
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
