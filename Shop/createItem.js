const Shop = require('../schema/shop-schema');

const createItem = async (req, res) => {
    const { itemPic, itemPrices, itemName, category } = req.body;

    if (!itemPic || !itemPrices || !itemName || !category) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that all duration prices are provided
    const { "7day": price7, "14day": price14, "30day": price30 } = itemPrices;
    if (price7 == null || price14 == null || price30 == null) {
        return res.status(400).json({ message: "All itemPrices durations are required" });
    }

    try {
        const newItem = new Shop({
            itemPic,
            itemName,
            category,
            itemPrices,
            // itemCode will be auto-generated
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error("Error creating item:", error);
        res.status(500).json({ message: "Server error while creating item" });
    }
};

module.exports = createItem;
