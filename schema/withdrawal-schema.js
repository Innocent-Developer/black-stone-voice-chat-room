const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WithdrawalSchema = new Schema({
  ui_id: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  request_date: {
    type: Date,
    default: Date.now,
  },
  approved_date: {
    type: Date,
  },
});

const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);
module.exports = Withdrawal;
