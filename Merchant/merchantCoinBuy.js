const Merchant = require("../schema/merchantschema");
const CoinPurchaseRequest = require("../schema/CoinPurchaseRequest");

const merchantBuycoin = async (req, res) => {
  try {
    const { ui_id, coinAmount, paymentMethod, transactionHash, payPrice } =
      req.body;

    if (
      !ui_id ||
      !coinAmount ||
      !paymentMethod ||
      !transactionHash ||
      !payPrice
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if merchant exists
    const merchant = await Merchant.findOne({ ui_id });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found." });
    }

    // Check if transactionHash is unique (avoid duplicates)
    const existingRequest = await CoinPurchaseRequest.findOne({
      transactionHash,
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Transaction hash already used." });
    }

    // Create purchase request with status pending
    const newRequest = new CoinPurchaseRequest({
      ui_id,
      coinAmount,
      paymentMethod,
      transactionHash,
      payPrice,
    });

    await newRequest.save();

    res.status(200).json({
      message: "Coin purchase request submitted, awaiting admin approval.",
      requestId: newRequest._id,
    });
  } catch (error) {
    console.error("Error in merchantBuycoin:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = merchantBuycoin;
