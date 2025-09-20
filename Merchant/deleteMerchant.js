const Merchant = require("../schema/merchantschema");

const deleteMerchant = async (req, res) => {
  try {
    const { merchantEmail } = req.body;
    if (!merchantEmail) {
      return res.status(400).json({ message: "Merchant email is required." });
    };
    const deletedMerchant = await Merchant.findOneAndDelete({ merchantEmail });
    if (!deletedMerchant) {
      return res.status(404).json({ message: "Merchant not found." });
    };
    return res.status(200).json({ message: "Merchant deleted successfully." });
  }
    catch (error) {
    console.error("Error deleting merchant:", error);
    return res.status(500).json({ message: "Internal server error." });
  } 
};

module.exports = deleteMerchant;