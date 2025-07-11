// models/OtpVerification.js
const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  hashedPassword: { type: String, required: true },
  gender: { type: String, required: true },
  country: { type: String, required: true },
  ui_id: { type: String, required: true },
  avatarUrl: { type: String },
  userName: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // expires in 5 minutes
});

const otpVerification= mongoose.model("OtpVerification", otpVerificationSchema);

module.exports=otpVerification;