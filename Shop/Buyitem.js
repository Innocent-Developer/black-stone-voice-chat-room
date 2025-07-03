const Shop = require("../schema/shop-schema"); // Mongoose model
const AccountCreate = require("../schema/account-create"); // Mongoose model
const History = require("../schema/Shop-histroy"); // Ensure file is correctly named

const buyItem = async (req, res) => {
  try {
    const { itemCode, ui_id } = req.body;

    // Find the item using itemCode
    const item = await Shop.findOne({ itemCode });
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    // Find the user account
    const account = await AccountCreate.findOne({ ui_id });
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }

    const itemPrice = item.itemPrice;
    const accountBalance = account.gold;

    if (itemPrice > accountBalance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct item price from user's gold
    account.gold -= itemPrice;
    await account.save();

    // Record the transaction in purchase history
    await History.create({
      itemCode: item.itemCode, // Not itemId unless your schema uses itemId
      itemPrice: item.itemPrice,
      ui_id,
    });

    return res.status(200).json({
      message: "Item purchased successfully",
      remainingGold: account.gold,
      itemPurchased: item.itemName || item.itemCode,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports= buyItem