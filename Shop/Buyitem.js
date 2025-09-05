const Shop = require("../schema/shop-schema");
const AccountCreate = require("../schema/account-create");
const History = require("../schema/Shop-histroy");

const buyItem = async (req, res) => {
  try {
    // Handle both spellings for backward compatibility
    const { itemCode, ui_id, duration, durication, u_id } = req.body;
    const actualDuration = duration || durication;
    const actualUid = ui_id || u_id; // Handle both ui_id and u_id

    // Validate input
    if (!itemCode || !actualUid || !actualDuration) {
      return res.status(400).json({
        message: "itemCode, user ID, and duration are required"
      });
    }

    // Convert numeric duration to string format for schema + price lookup
    let durationKey;
    if (typeof actualDuration === "number") {
      durationKey = `${actualDuration}day`;  // e.g., 7 -> "7day"
    } else {
      durationKey = actualDuration; // already string
    }

    // Find item
    const item = await Shop.findOne({ itemCode });
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    // Get price for selected duration
    const itemPrice = item.itemPrices?.[durationKey];
    if (itemPrice == null) {
      return res.status(400).json({
        message: `Price for duration '${durationKey}' not available`
      });
    }

    // Find user
    const account = await AccountCreate.findOne({ ui_id: actualUid });
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }

    // Check balance
    if (itemPrice > account.gold) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct price
    account.gold -= itemPrice;
    await account.save();

    // Log purchase history
    
    await History.create({
      itemCode: item.itemCode,
      itemPrice,
      durication: durationKey, // match schema
      ui_id: actualUid,
    });

    return res.status(200).json({
      message: "Item purchased successfully",
      remainingGold: account.gold,
      itemPurchased: item.itemName,
    });
  } catch (error) {
    console.error("Buy item error:", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = buyItem;
