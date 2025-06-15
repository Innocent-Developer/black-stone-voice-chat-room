const Merchant = require("../schema/merchantschema");

const getMerchantById = async (req, res) => {
  try {
    const ui_id = req.params.ui_id;

    const user = await Merchant.findOne({ ui_id: ui_id });

    if (!user) {
      return res.status(404).json({ message: "No merchant found." });
    }

    res.status(200).json({
      message: "Merchant information retrieved successfully.",
      user
    });
  } catch (error) {
    console.error("Error fetching merchant:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = getMerchantById;
