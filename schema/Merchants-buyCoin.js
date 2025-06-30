const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const merchantBuyCoinSchema = new Schema(
  {
    merchantId: {
      type: Number,
      required: true
    },
    email:{
        type : String,
        required: true
        
    },
    amount: {
      type: Number,
      required: true
    },
    transactionDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model("MerchantBuyCoin", merchantBuyCoinSchema);
