const buycoinMerchant = require("../schema/buycoinmerchent");

const getAllTransactionMerchants = async () => {
  try {
    const transactions = await buycoinMerchant.find({});
    return {
      success: true,
      data: transactions
    };
  } catch (error) {
    console.error("Error fetching merchant transactions:", error);
    return {
      success: false,
      message: "Failed to fetch merchant transactions",
      error: error.message
    };
  }
};

module.exports = getAllTransactionMerchants;
