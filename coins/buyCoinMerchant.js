const buycoinMerchant = require("../schema/buycoinmerchent");
const AccountCreate = require("../schema/account-create"); // Ensure path is correct

const coinbuymerchant = async (req, res) => {
  try {
    const { ui_id, merchant_id, buycoin, status } = req.body;

    // Validate required fields
    if (!ui_id || !merchant_id || !buycoin) {
      return res
        .status(400)
        .json({ message: "ui_id, merchant_id, and buycoin are required." });
    }

    // Check if user exists in AccountCreate
    const userExists = await AccountCreate.findOne({ ui_id });

    if (!userExists) {
      return res
        .status(404)
        .json({
          message: "User not found. Cannot proceed with coin purchase.",
        });
    }

    // Proceed to save coin purchase
    const newPurchase = new buycoinMerchant({
      ui_id,
      merchant_id,
      buycoin,
      status: status || "pending",
    });

    const savedPurchase = await newPurchase.save();

    return res.status(201).json({
      message: "Coin purchase recorded successfully.",
      data: savedPurchase,
    });
  } catch (error) {
    console.error("Error in coinbuymerchant:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


module.exports = coinbuymerchant;
