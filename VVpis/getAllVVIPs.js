const VvpiUsers = require("../schema/vvpiusers");

const getAllVVIPs = async (req, res) => {
    try {
        const vvpiItems = await VvpiUsers.find();
        return res.status(200).json({
            message: "VVIPS items retrieved successfully",
            vvpiItems,
        });
    } catch (error) {
        console.error("Get all VVIPS error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = getAllVVIPs;