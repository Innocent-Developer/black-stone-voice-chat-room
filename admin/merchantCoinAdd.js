const Merchant = require("../schema/merchantschema");


const merchantCoinAdd = async (req, res) => {
    const { ui_id, amount } = req.body;
    try {
        // Validate input
        if (!ui_id || !amount) {
            return res.status(400).json({ message: "ui_id and amount are required." });
        }

        // Find the merchant by ui_id
        const merchant = await Merchant.findOne({ ui_id });
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found." });
        }

        // Update the merchant's coin balance
        merchant.coinBalance = (merchant.coinBalance || 0) + amount;
        await merchant.save();

        // Return success response
        res.status(200).json({
            message: "Coins added successfully.",
            updatedCoins: merchant.coinBalance,
        });
    } catch (error) {
        console.error("Error adding coins to merchant:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = merchantCoinAdd;