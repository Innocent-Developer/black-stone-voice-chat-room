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

    // Convert numeric duration to string format if needed
    let durationKey = actualDuration;
    if (typeof actualDuration === 'number') {
      durationKey = `${actualDuration}day`;
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
        message: `Price for duration '${actualDuration}' not available` 
      });
    }

    // Find user
    const account = await AccountCreate.findOne({ ui_id: actualUid });
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }

    if (itemPrice > account.gold) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct price
    account.gold -= itemPrice;
    await account.save();

    // Save history
    await History.create({
      itemCode: item.itemCode,
      itemPrice,
      duration: actualDuration,
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