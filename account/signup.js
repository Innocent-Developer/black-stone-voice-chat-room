const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const AccountCreate = require("../schema/account-create");
const OtpVerification = require("../schema/OtpVerification");

// Email config (inside the file)
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Generate unique UI ID
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
  const { email, password, gender, country, avatarUrl, userName } = req.body;

  try {
    if (!email || !password || !gender || !country) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await AccountCreate.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedPassword = await bcrypt.hash(password, 10);
    const ui_id = await generateUniqueUiId();

    await OtpVerification.findOneAndDelete({ email }); // Remove old OTP

    await new OtpVerification({
      email,
      otp,
      hashedPassword,
      gender,
      country,
      ui_id,
      avatarUrl,
      userName,
    }).save();

    await transporter.sendMail({
      from: process.env.MAIL,
      to: email,
      subject: "Verify Your Account",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = signup;
