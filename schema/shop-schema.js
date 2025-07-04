const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Helper function to generate a random 6-digit number
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000); // Ensures 6-digit number
}

const ShopSchema = new Schema({
  itemPic: {
    type: String,
    required: true,
  },
  itemPrice: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemCode: {
    type: Number,
    unique: true, // Ensure itemCode is unique
  },
  category: { type: String, required: true },
  
});

// Pre-save middleware to auto-generate itemCode
ShopSchema.pre("save", async function (next) {
  if (!this.itemCode) {
    let unique = false;
    let code;

    while (!unique) {
      code = generateSixDigitCode();
      const existing = await mongoose.models.Shop.findOne({ itemCode: code });
      if (!existing) unique = true;
    }

    this.itemCode = code;
  }
  next();
});

module.exports = mongoose.model("Shop", ShopSchema);
