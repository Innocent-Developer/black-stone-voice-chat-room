const mongoose = require("mongoose");
const schema = mongoose.Schema;

const coinbuymerchent = new schema({
  ui_id: {
    type: Number,
    required: true,
  },
  merchant_id: {
    type: Number,
    required: true,
  },
  buycoin: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "failed"],
    default: "pending",
  },
});
const buycoinMerchant = mongoose.model("buycoinMerchant", coinbuymerchent);
module.exports = buycoinMerchant;
