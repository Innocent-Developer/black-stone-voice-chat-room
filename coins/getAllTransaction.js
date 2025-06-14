const BuyCoins = require("../schema/buycoins-schema");

const getAllTransaction = async (req, res) => {
  try {
    // Fetch all transactions from the database
    const transactions = await BuyCoins.find({});

    // Check if transactions were found
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found." });
    }
    const totalTransaction = transactions.length;
    const pendingTransactions = transactions.filter(
      (transaction) => transaction.status === "pending"
    );
    const completedTransactions = transactions.filter(
      (transaction) => transaction.status === "approved"
    );
    const declinedTransactions = transactions.filter(
      (transaction) => transaction.status === "failed"
    );

    // Return the list of transactions
    res.status(200).json({
      totalTransaction: totalTransaction,
      Total_Approve: completedTransactions.length,
      Total_Pending: pendingTransactions.length,
      Total_Declined: declinedTransactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = getAllTransaction;
