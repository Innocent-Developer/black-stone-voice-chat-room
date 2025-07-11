const AccountCreate = require("../schema/account-create");
const OtpVerification = require("../schema/OtpVerification");

const otpVerification = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const temp = await OtpVerification.findOne({ email });
    if (!temp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (otp !== temp.otp) {
      return res.status(401).json({ message: "Incorrect OTP." });
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

    // Return safe info only
    res.status(201).json({
      message: "Account created successfully.",
      user: {
        email: newUser.email,
        gender: newUser.gender,
        country: newUser.country,
        avatarUrl: newUser.avatarUrl,
        userName: newUser.userName,
        ui_id: newUser.ui_id,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = otpVerification;
