const Gift = require("../schema/Gifts");

const getAllGifts = async (req, res) => { 
    try {
        const gifts = await Gift.find({}).sort({ createdAt: -1 }); // Sort by creation date, most recent first
        res.status(200).json({
            success: true,
            message: "Gifts retrieved successfully",
            gifts: gifts
        });
    } catch (error) {
        console.error("Error retrieving gifts:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
module.exports = getAllGifts;