const CoinPrice = require("../schema/coinPrice-schema");

const updateCoinPrice = async (req, res) => {
  try {
    const { goldCoin, diamondCoin } = req.body;

    // // Validate input
    // if (!goldCoin || !diamondCoin) {
    //   return res
    //     .status(400)
    //     .json({ message: "Both goldCoin and diamondCoin are required." });
    // }

    // Update or create coin price
    const coinPrice = await CoinPrice.findOneAndUpdate(
      {},
      { goldCoin, diamondCoin, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Coin prices updated successfully.",
      coinPrice,
    });
  } catch (error) {
    console.error("Error updating coin prices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = updateCoinPrice;
