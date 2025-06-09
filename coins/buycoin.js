const AccountCreate = require("../schema/account-create");
const BuyCoins = require("../schema/buycoins-schema");

const buyCoinapi = async (req, res) => {
  try {
    const { ui_id, coinName, paymentMethod, transactionHash, payPrice } = req.body;

    // Validate required fields
    if (!ui_id || !coinName || !paymentMethod || !payPrice || !transactionHash) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if ui_id exists in AccountCreate
    const existingUser = await AccountCreate.findOne({ ui_id });
    if (!existingUser) {
      return res.status(404).json({ message: "Invalid ui_id. User does not exist." });
    }

    // Check if transactionHash already exists
    const existingTransaction = await BuyCoins.findOne({ transactionHash });
    if (existingTransaction) {
      return res.status(409).json({ message: "Transaction hash already exists." });
    }

    // Create new buy coin entry
    const newBuyCoin = new BuyCoins({
      ui_id,
      coinName,
      paymentMethod,
      payPrice,
      transactionHash,
      status: "pending", // Default status
    });

    await newBuyCoin.save();

    res.status(201).json({
      message: "Coin purchase initiated successfully. Wait for admin approval.",
      data: newBuyCoin,
    });
  } catch (error) {
    console.error("Error in buyCoin:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = buyCoinapi;
