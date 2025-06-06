const mongoose = require("mongoose");
const schema = mongoose.Schema;

const CoinPurchaseRequestSchema = new schema({
  ui_id: {
    type: Number,
    required: true,
  },
  coinAmount: {
    type: Number,
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
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CoinPurchaseRequest", CoinPurchaseRequestSchema);
