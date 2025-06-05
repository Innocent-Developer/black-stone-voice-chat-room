const bcrypt = require("bcryptjs");
const AccountCreate = require("../schema/account-create");

const newPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    // Validate input
    if (!email || !newPassword || !otp) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find user by email
    const user = await AccountCreate.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if OTP is valid and not expired
    if (user.resetPasswordOtp !== otp || Date.now() > user.otpExpiration) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.otpExpiration = null;

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = newPassword;
