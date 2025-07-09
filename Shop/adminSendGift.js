const Shop = require("../schema/shop-schema");
const AccountCreate = require("../schema/account-create");
const History = require("../schema/Shop-histroy");

const adminSendGift = async (req, res) => {
  try {
    const { itemCode, ui_id, durication } = req.body;

    // Validate request body
    if (!itemCode || !ui_id || !durication) {
      return res
        .status(400)
        .json({ message: "itemCode, ui_id, and durication are required." });
    }

    // Validate duration
    const validDurations = ["7day", "14day", "30day"];
    if (!validDurations.includes(durication)) {
      return res
        .status(400)
        .json({
          message: "Invalid duration. Must be '7day', '14day', or '30day'.",
        });
    }

    // Find item by code
    const item = await Shop.findOne({ itemCode });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Get item price for specified duration
    const itemPrice = item.itemPrices?.[durication];
    if (itemPrice == null) {
      return res
        .status(400)
        .json({ message: `No price set for duration '${durication}'.` });
    }

    // Find user by ui_id
    const user = await AccountCreate.findOne({ ui_id });
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    // Save gift history
    await History.create({
      itemCode: item.itemCode,
      itemPrice,
      durication,
      ui_id,
    });

    return res.status(200).json({
      message: `Gift sent successfully to user ID ${ui_id}.`,
      itemGifted: item.itemName,
      duration: durication,
      value: itemPrice,
    });
  } catch (error) {
    console.error("Admin send gift error:", error.message);
    return res
      .status(500)
      .json({
        message: "Server error while sending gift",
        error: error.message,
      });
  }
};

module.exports = adminSendGift;
