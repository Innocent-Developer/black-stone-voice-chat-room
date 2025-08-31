const VvpiUsers = require("../schema/vvpiusers");

const deletedVVIPS = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the VVIPS item by ID and delete it
        const vvpiItem = await VvpiUsers.findByIdAndDelete(id);
        if (!vvpiItem) {
            return res.status(404).json({ message: "VVIPS item not found" });
        }

        return res.status(200).json({
            message: "VVIPS item deleted successfully",
            vvpiItem,
        });

    } catch (error) {
        console.error("Delete VVIPS error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = deletedVVIPS;