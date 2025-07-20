const mongoose = require("mongoose");
const { Schema } = mongoose;  // ✅ FIXED LINE

const Gifts = new Schema({
  giftCode: {
    type: Number,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  giftName: {
    type: String
  },
  giftImage: {
    type: String
  },
  giftFile: {
    type: String
  },
  giftCategory: {
    type: String,
    default: "normal"
  }
});

const Gift = mongoose.model("Gift", Gifts);
module.exports = Gift;
