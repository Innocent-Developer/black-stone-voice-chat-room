const Shop = require('../schema/shop-schema'); // Mongoose model

const createItem = async (req, res) => {
    const { itemPic, prices, itemName, category } = req.body;

    // Validate presence of required fields
    if (!itemPic || !itemName || !category || !prices) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate prices format (basic check)
    const { "7day": price7, "14day": price14, "30day": price30 } = prices;
    if (price7 == null || price14 == null || price30 == null) {
        return res.status(400).json({ message: "All durations (7, 14, 30 days) must have prices" });
    }

    try {
        const newItem = new Shop({
            itemPic,
            prices,
            itemName,
            category,
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error("Error creating item:", error);
        res.status(500).json({ message: "Server error while creating item" });
    }
};

module.exports = createItem;
