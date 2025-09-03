const Shop = require("../schema/shop-schema");
const AccountCreate = require("../schema/account-create");
const History = require("../schema/Shop-histroy");

const buyItem = async (req, res) => {
  try {
    // Handle both spellings for backward compatibility
    const { itemCode, ui_id, duration, durication } = req.body;
    const actualDuration = duration || durication;

    // Validate input
    if (!itemCode || !ui_id || !actualDuration) {
      return res.status(400).json({ 
        message: "itemCode, ui_id, and duration are required" 
      });
    }

    // Find item
    const item = await Shop.findOne({ itemCode });
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    // Get price for selected duration
    const itemPrice = item.itemPrices?.[actualDuration];
    if (itemPrice == null) {
      return res.status(400).json({ 
        message: `Price for duration '${actualDuration}' not available` 
      });
    }

    // Find user
    const account = await AccountCreate.findOne({ ui_id });
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
      ui_id,
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