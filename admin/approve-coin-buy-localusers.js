const AccountCreate = require("../schema/account-create.js");
const BuyCoins = require("../schema/buycoins-schema.js");

const approveCoinBuyLocalUsers = async (req, res) => {
  try {
    const { ui_id, amount, request_id } = req.body;

    // Validate input
    if (!ui_id || !amount || !request_id) {
      return res.status(400).json({ message: "ui_id, amount, and request_id are required." });
    }

    // Check if user exists
    const user = await AccountCreate.findOne({ ui_id });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the specific pending buy coin request
    const buyRequest = await BuyCoins.findOne({ _id: request_id, ui_id, status: "pending" });
    if (!buyRequest) {
      return res.status(404).json({
        message: "No pending coin purchase request found with the provided ID for this user.",
      });
    }

    // Update user's gold
    user.gold = (user.gold || 0) + amount;
    await user.save();

    // Approve the buy coin request
    buyRequest.status = "approved";
    await buyRequest.save();

    // Return response
    res.status(200).json({
      message: "Coin purchase approved. Gold added to user account.",
      user: {
        ui_id: user.ui_id,
        updatedGold: user.gold,
      },
      transaction: buyRequest,
    });
  } catch (error) {
    console.error("Error in approving coin request:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = approveCoinBuyLocalUsers;
