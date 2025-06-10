const Withdrawal = require("../schema/withdrawal-schema");
const AccountCreate = require("../schema/account-create.js");

const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.body;
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    // const account = await AccountCreate.findById(withdrawal.accountId);
    // if (!account) {
    //   return res.status(404).json({ message: "Account not found" });
    // }
    const updatedAccount = await AccountCreate.updateOne(
      { _id: account._id },
      {
        $inc: { balance: -withdrawal.amount },
      }
    );
    const updatedWithdrawal = await Withdrawal.updateOne(
      { _id: withdrawal._id },
      {
        $set: { status: "approved" },
      }
    );
    res.json({ message: "Withdrawal approved" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = approveWithdrawal;
