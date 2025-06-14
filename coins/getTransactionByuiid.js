const AccountCreate = require("../schema/account-create");
const BuyCoins = require("../schema/buycoins-schema");

const getTransactionByUIID = async (req, res) => {
  try {
    const ui_id = req.params.ui_id;

    // Validate UI ID
    if (!ui_id || typeof ui_id !== "string") {
      return res.status(400).json({ message: "Invalid UI ID provided." });
    }

    // Check if user exists
    const user = await AccountCreate.findOne({ ui_id: ui_id });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch transactions for the user
    const transactions = await BuyCoins.find({ ui_id: ui_id });

    // Check if transactions exist
    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this user." });
    }

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = getTransactionByUIID;