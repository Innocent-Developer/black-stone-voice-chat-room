const AccountCreate = require("../schema/account-create.js");
const profileOtps = require("./tempOtpStore");
const nodemailer = require("nodemailer");

// Email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password",
  },
});

const completeUserProfile = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await AccountCreate.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    profileOtps[email] = {
      otp,
      data: req.body, // Save all update data temporarily
      expiresAt: Date.now() + 5 * 60 * 1000, // 5-minute expiry
    };

    // Send OTP
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Verify Profile Update",
      text: `Your OTP for updating your profile is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent to your email for profile update verification." });

  } catch (error) {
    console.error("Send OTP for profile update error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = completeUserProfile;
