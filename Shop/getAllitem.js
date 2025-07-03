const Shop = require("../schema/shop-schema"); // Mongoose model

const getAllItems = async (req, res) => {
  try {
    const items = await Shop.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports= getAllItems