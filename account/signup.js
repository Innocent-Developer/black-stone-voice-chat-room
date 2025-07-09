const AccountCreate = require("../schema/account-create.js");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const tempAccounts = {}; // Temporary store for OTP and user data

// Mail configuration
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com", // Namecheap's SMTP server
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Generate a unique 6-digit ui_id
const generateUniqueUiId = async () => {
  let ui_id;
  let exists = true;
  while (exists) {
    ui_id = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const found = await AccountCreate.findOne({ ui_id });
    if (!found) exists = false;
  }
  return ui_id;
};

const accountCreate = async (req, res) => {
  const { email, password, gender, country,avatarUrl ,userName } = req.body;

  try {
    if (!email || !password || !gender || !country) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await AccountCreate.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const ui_id = await generateUniqueUiId(); // Generate unique UI ID

    tempAccounts[email] = {
      email,
      password: hashedPassword,
      gender,
      country,
      ui_id,
      userName,
      avatarUrl,
      otp,
      createdAt: Date.now(),
    };

    await transporter.sendMail({
      from: process.env.MAIL,
      to: email,
      subject: "Verify your account",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("Error in account creation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = accountCreate;
module.exports.tempAccounts = tempAccounts; // Export for OTP verification
