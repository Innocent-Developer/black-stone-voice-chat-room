const Withdrawal = require("../schema/withdrawal-schema");
const AccountCreate = require("../schema/account-create.js");

const getwithdrawByUIID = async (req, res) => {
  try {
    const ui_id = req.params.ui_id;
    const getUser = await AccountCreate.findOne({ ui_id: ui_id });
    const withdrawal = await Withdrawal.find({ ui_id: ui_id });
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    const pendingWithdraws = withdrawal.filter(
      (withdraw) => withdraw.status === "pending"
    );
    const approvedWithdraws = withdrawal.filter(
      (withdraw) =>
        withdraw.status === "approved" || withdraw.status === "completed"
    );
    const rejectedWithdraws = withdrawal.filter(
      (withdraw) => withdraw.status === "rejected"
    );
    res.json({
      TotalWithDraws: withdrawal.length,
      PendingWithDraws: pendingWithdraws.length,
      approvedWithDraws: approvedWithdraws.length,
      rejectedWithdraws: rejectedWithdraws.length,
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = getwithdrawByUIID;
