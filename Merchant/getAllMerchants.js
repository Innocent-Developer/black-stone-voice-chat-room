const Merchant = require("../schema/merchantschema");

const getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find().sort({ ui_id: -1 });

    if (merchants.length === 0) {
      return res.status(404).json({ message: "No merchants found." });
    }

    const pendingMerchants = merchants.filter(
      (merchant) => merchant.status === "pending"
    );
    const approvedMerchants = merchants.filter(
      (merchant) => merchant.status === "approved"
    );
    res.status(200).json({
      message: "All merchants retrieved successfully.",
      TotalMerchants: merchants.length,
      PendingMerchants: pendingMerchants.length,
      ApprovedMerchants: approvedMerchants.length,
      merchants,
    });
  } catch (error) {
    console.error("Error retrieving merchants:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = getAllMerchants;
