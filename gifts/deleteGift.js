const Gift = require("../schema/Gifts");

const deleteGift = async (req, res) => {
    try {
        const { giftId } = req.params;

        if (!giftId) {
            return res.status(400).json({
                success: false,
                message: "Gift ID is required"
            });
        }

        // Find and delete the gift
        const deletedGift = await Gift.findByIdAndDelete(giftId);

        if (!deletedGift) {
            return res.status(404).json({
                success: false,
                message: "Gift not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Gift deleted successfully",
            deletedGift: {
                _id: deletedGift._id,
                giftName: deletedGift.giftName,
                amount: deletedGift.amount,
                giftCode: deletedGift.giftCode
            }
        });

    } catch (error) {
        console.error("Error deleting gift:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = deleteGift; 