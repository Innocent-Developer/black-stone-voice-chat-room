const Shop = require("../schema/shop-schema"); // Import the Shop model

const updateItem = async (req, res) => {
  try {
    const { itemCode } = req.body; 
    const { itemName, itemPrice, description, imageUrl } = req.body; 

    // Find item by itemCode and update it
    const updatedItem = await Shop.findOneAndUpdate(
      { itemCode }, // filter
      { itemName, itemPrice, description, imageUrl }, // fields to update
      { new: true } // return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item updated successfully",
      updatedItem,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports=updateItem