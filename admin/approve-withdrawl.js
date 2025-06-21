const Withdrawal = require("../schema/withdrawal-schema");
const AccountCreate = require("../schema/account-create.js");
const CoinPrice = require("../schema/coinPrice-schema");

const approveWithdrawal = async (req, res) => {
  try {
    const {id} = req.body;

    if (!id) {
      return res.status(400).json({ message: "Withdrawal ID is required." });
    }

    // 1. Find the withdrawal by ID
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    // 2. Make sure withdrawal has a valid ui_id
    if (!withdrawal.ui_id) {
      return res
        .status(400)
        .json({ message: "Withdrawal does not contain a valid ui_id." });
    }

    // 3. Find the associated user account using ui_id (not _id)
    const account = await AccountCreate.findOne({ ui_id: withdrawal.ui_id });
    if (!account) {
      return res.status(404).json({ message: "Account not found for ui_id." });
    }

    // 4. Get the latest diamond coin price
    const priceData = await CoinPrice.findOne().sort({ lastUpdated: -1 });
    if (!priceData || !priceData.diamondCoin) {
      return res.status(500).json({ message: "Diamond price not found." });
    }

    // status check
    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        message: "Withdrawal can only be approved if it is pending.",
      });
    }
    const status = withdrawal.status;
    if (status === "approved") {
      return res.status(400).json({ message: "Withdrawal already approved." });
    }
    const diamondPrice = parseFloat(priceData.diamondCoin);
    const amountPKR = withdrawal.amount;
    const diamondToDeduct = amountPKR / diamondPrice;

    // 5. Check balance
    if (account.diamond < diamondToDeduct) {
      return res.status(400).json({ message: "Insufficient diamonds." });
    }

    // 6. Deduct diamonds
    await AccountCreate.updateOne(
      { ui_id: withdrawal.ui_id },
      {
        $inc: { diamond: -diamondToDeduct },
      }
    );

    // 7. Update withdrawal status
    await Withdrawal.updateOne(
      { _id: withdrawal._id },
      {
        $set: { status: "approved" },
      }
    );

    // 8. Return success
    res.json({
      message: "Withdrawal approved successfully.",
      diamondsDeducted: diamondToDeduct.toFixed(2),
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = approveWithdrawal;
