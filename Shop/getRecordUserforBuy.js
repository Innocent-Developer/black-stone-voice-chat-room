const AccountCreate = require("../schema/account-create");
const History = require("../schema/Shop-histroy"); // Ensure the filename is 


const  getRecordUserBuy = async (req, res) => {
  try {
    const { ui_id } = req.body;

    if (!ui_id) {
      return res.status(400).json({ message: "ui_id is required" });
    }

    // Find user
    const account = await AccountCreate.findOne({ ui_id });
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }

    // Fetch purchase history
    const purchaseHistory = await History.find({ ui_id }).sort({ purchaseDate: -1 });

    return res.status(200).json({
      message: "Purchase history retrieved successfully",
      purchaseHistory,
    });
  } catch (error) {
    console.error("Get purchase history error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = getRecordUserBuy;