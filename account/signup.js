const express = require("express");
const bcrypt = require("bcryptjs");
const AccountCreate = require("../schema/account-create");
const OtpVerification = require("../schema/OtpVerification");
const sendOtpEmail = require("../utils/sendOtpEmail");

const router = express.Router();

const generateUniqueUiId = async () => {
  let ui_id;
  let exists = true;
  while (exists) {
    ui_id = Math.floor(100000 + Math.random() * 900000).toString();
    const found = await AccountCreate.findOne({ ui_id });
    if (!found) exists = false;
  }
  return ui_id;
};

const signup =  async (req, res) => {
  const { email, password, gender, country, avatarUrl, userName, name, number } = req.body;

  try {
    if (!email || !password || !gender || !country) {
      return res.status(400).json({ message: "Email, password, gender, and country are required." });
    }

    const existingUser = await AccountCreate.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const ui_id = await generateUniqueUiId();

    await OtpVerification.findOneAndDelete({ email }); // Remove old OTP

    await new OtpVerification({
      email,
      otp,
      hashedPassword,
      gender,
      country,
      avatarUrl,
      userName,
      name,
      number,
      ui_id,
    }).save();

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = signup;
