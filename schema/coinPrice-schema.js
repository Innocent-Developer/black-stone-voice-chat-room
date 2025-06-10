const mongoose = require("mongoose");
const schema = mongoose.Schema;

const coinPrice = new schema({
  goldCoin: {
    type: String,
    required: true,
  },
  diamondCoin: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});
const CoinPrice = mongoose.model("CoinPrice", coinPrice);
module.exports = CoinPrice;
