const Shop = require("../schema/shop-schema");
const AccountCreate = require("../schema/account-create");
const History = require("../schema/Shop-histroy"); // Ensure the filename is correct

const adminSendGift = async (req, res) => {
  try {
    const { itemCode, ui_id, durication } = req.body;

    // Validate input
    if (!itemCode || !ui_id || !durication) {
      return res.status(400).json({ message: "itemCode, ui_id, and durication are required" });
    }

    // Find item
    const item = await Shop.findOne({ itemCode });
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    // Get price for selected duration
    const itemPrice = item.itemPrices?.[durication];
    if (itemPrice == null) {
      return res.status(400).json({ message: `Price for duration '${durication}' not available` });
    }

    // Find user
    const account = await AccountCreate.findOne({ ui_id });
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }

    // Add gift to user's account
    account.gold += itemPrice;
    await account.save();

    // Save history
    await History.create({
      itemCode: item.itemCode,
      itemPrice,
      durication,
      ui_id,
    });

    return res.status(200).json({
      message: "Gift sent successfully",
      newBalance: account.gold,
      itemGifted: item.itemName,
    });
  } catch (error) {
    console.error("Admin send gift error:", error.message);
    return res.status(500).json({ message: "Server error while sending gift" });
  }
}