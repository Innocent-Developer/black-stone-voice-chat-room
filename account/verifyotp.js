const express = require("express");
const AccountCreate = require("../schema/account-create");
const OtpVerification = require("../schema/OtpVerification");



const otpVerification = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const temp = await OtpVerification.findOne({ email });

    if (!temp) {
      return res.status(400).json({ message: "OTP expired or not found." });
    }

    if (parseInt(otp) !== temp.otp) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    const newUser = new AccountCreate({
      email: temp.email,
      password: temp.hashedPassword,
      gender: temp.gender,
      country: temp.country,
      avatarUrl: temp.avatarUrl,
      userName: temp.userName,
      ui_id: temp.ui_id,
    });

    await newUser.save();
    await OtpVerification.deleteOne({ email });

    res.status(201).json({ message: "Account created successfully.", user: newUser });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = otpVerification;
