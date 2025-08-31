const Shop = require("../schema/shop-schema");

const updateItem = async (req, res) => {
  try {
    const { id } = req.params; // The frontend sends the ID in the URL
    const { itemName, itemPrices, category, itemPic, image } = req.body;

    // Validate required fields
    if (!itemName || !itemPrices || !category) {
      return res.status(400).json({ message: "Item name, prices, and category are required" });
    }

    // Validate that all duration prices are provided
    const { "7day": price7, "14day": price14, "30day": price30 } = itemPrices;
    if (price7 == null || price14 == null || price30 == null) {
      return res.status(400).json({ message: "All itemPrices durations are required" });
    }

    // Find item by ID and update it
    const updatedItem = await Shop.findByIdAndUpdate(
      id, // Using the ID from URL params
      { 
        itemName, 
        itemPrices, 
        category, 
        itemPic, 
        image 
      }, // fields to update
      { new: true, runValidators: true } // return the updated document and run validation
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item updated successfully",
      updatedItem,
    });
  } catch (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = updateItem;
