const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Merchant = new schema({
  ui_id: {
    type: Number,
    required: true,
  },
  merchantName: {
    type: String,
    required: true,
  },
  merchantAddress: {
    type: String,
    required: true,
  },
  merchantPhoneNumber: {
    type: String,
    required: true,
  },
  merchantEmail: {
    type: String,
    required: true,
  },
  coinBalance: {
    type: Number,
    default: 0,
  },
  payment_Account: [
    {
      tital: {
        type: String,
      },
      acountNumber: {
        type: String,
      },
      bankAccountName: {
        type: String,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  merchantLogoUrl: {
    type: String,
    default: "https://example.com/default-logo.png", // Default logo URL
  },
});
const MerchantSchema = mongoose.model("Merchant", Merchant);
module.exports = MerchantSchema;
