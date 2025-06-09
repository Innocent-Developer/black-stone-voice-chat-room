const mongoose = require("mongoose");
const schema = mongoose.Schema;

const buycoinsSchema = new schema({
  ui_id: {
    type: Number,
    required: true,
  },
  coinName: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  transactionHash:{
    type: String,
    required: true,
    unique: true,

  },
  payPrice: {
    type: Number,
    required: true,
  },
  status:{
    type: String,
    required: true,
    enum: ["pending", "approved", "failed"],
    default: "pending",
  }
});
const BuyCoins = mongoose.model("BuyCoins", buycoinsSchema);
module.exports = BuyCoins;
