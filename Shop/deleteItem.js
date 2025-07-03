const Shop = require("../schema/shop-schema"); // Import the Shop model

const deleteItem = async (req, res) => {
  try {
    const { itemCode } = req.body;

    // Find and delete the item
    const deletedItem = await Shop.findOneAndDelete({ itemCode });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
      deletedItem,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports=deleteItem;