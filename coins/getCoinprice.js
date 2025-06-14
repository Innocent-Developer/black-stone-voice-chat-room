const CoinPrice = require("../schema/coinPrice-schema");

const getCoinPrice = async (req, res) => {
    try {
        // Fetch the latest coin price
        const coinPrice = await CoinPrice.findOne().sort({ lastUpdated: -1 });
    
        if (!coinPrice) {
        return res.status(404).json({ message: "Coin prices not found." });
        }
    
        res.status(200).json({
        message: "Coin prices retrieved successfully.",
        coinPrice,
        });
    } catch (error) {
        console.error("Error fetching coin prices:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = getCoinPrice;
// Compare this snippet from coins/getCoinprice.js: