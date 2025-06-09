const Withdrawal = require("../schema/withdrawal-schema");
const AccountCreate = require("../schema/account-create.js");

const requestWithdrawal = async (req, res) => {
  try {
    const { ui_id, amount, accountName, accountNumber, bankName } = req.body;

    // Validate input
    if (!ui_id || !amount || !accountName || !accountNumber || !bankName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if amount is a valid positive number
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }

    // Check if user exists
    const user = await AccountCreate.findOne({ ui_id });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Optional: Check if user has enough balance (if balance tracking is implemented)
    // if (user.balance < amount) {
    //   return res.status(400).json({ message: "Insufficient balance." });
    // }

    // Create withdrawal request
    const withdrawalRequest = new Withdrawal({
      ui_id,
      amount,
      accountName,
      accountNumber,
      bankName,
      status: "pending", // Optional: Default status
      requestedAt: new Date(), // Optional: Timestamp
      
    });

    await withdrawalRequest.save();

    res.status(201).json({
      message: "Withdrawal request created successfully. Wait for approval.",
      user: {
        ui_id: user.ui_id,
        name: user.name,
        email: user.email,
      },
      request: withdrawalRequest,
    });
  } catch (error) {
    console.error("Error in requesting withdrawal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = requestWithdrawal;
