const Withdrawal = require("../schema/withdrawal-schema");

const getAllWithdraws = async (req, res) => {
  try {
    // Fetch all withdrawal requests from the database
    const withdraws = await Withdrawal.find().sort({ requestedAt: -1 }); // Sort by requestedAt in descending order

    if (withdraws.length === 0) {
      return res.status(404).json({ message: "No withdrawal requests found." });
    }
    const pendingWithdraws = withdraws.filter(
      (withdraw) => withdraw.status === "pending"
    );
    const approvedWithdraws = withdraws.filter(
      (withdraw) =>
        withdraw.status === "approved" || withdraw.status === "completed"
    );
    const rejectedWithdraws = withdraws.filter(
      (withdraw) => withdraw.status === "rejected"
    );
    res.status(200).json({
      message: "Withdrawal requests retrieved successfully.",
      PendingWithDraws: pendingWithdraws.length,
      approvedWithdraws: approvedWithdraws.length,
      rejectedWithdraws: rejectedWithdraws.length,
      withdraws,
    });
  } catch (error) {
    console.error("Error in fetching withdrawal requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = getAllWithdraws;
