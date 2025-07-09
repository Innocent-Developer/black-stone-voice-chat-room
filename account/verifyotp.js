const AccountCreate = require("../schema/account-create.js");
const { tempAccounts } = require("./signup.js");

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const temp = tempAccounts[email];
    if (!temp) {
      return res.status(400).json({ message: "No OTP request found." });
    }

    if (parseInt(otp) !== temp.otp) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    const newUser = new AccountCreate({
      email: temp.email,
      password: temp.password,
      gender: temp.gender,
      country: temp.country,
      avatarUrl: temp.avatarUrl,
      userName: temp.userName,
      ui_id: temp.ui_id,
    });

    await newUser.save();
    delete tempAccounts[email];

    res.status(201).json({ message: "Account created successfully.", user: newUser });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = verifyOtp;
