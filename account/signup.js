const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const AccountCreate = require("../schema/account-create.js");

// Nodemailer transporter setup with Namecheap Private Email
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

// POST /api/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password ,userName ,gender ,country } = req.body;

    // Check if email already exists
    const existingUser = await AccountCreate.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }
    const userNameExists = await AccountCreate.findOne({ userName });
    if (userNameExists) { 
      return res.status(400).json({ message: "Username already in use." });
      }
      

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate sequential ui_id
    const lastUser = await AccountCreate.findOne().sort({ ui_id: -1 }).limit(1);
    const nextUiId = lastUser?.ui_id ? lastUser.ui_id + 1 : 5001;

    // Create new user
    const newUser = new AccountCreate({
      name,
      email,
      password: hashedPassword,
      userName,
      gender,
      country,
      ui_id: nextUiId,
    });

    await newUser.save();

    // Send welcome email
    const mailOptions = {
      from: `"Black Stone Voice Chat Room" <${process.env.MAIL}>`,
      to: email,
      subject: "🎉 Welcome to Black Stone Voice Chat Room!",
      html: `
  <div style="font-family:'Segoe UI', sans-serif; max-width:600px; margin:auto; background:#1a1a1a; color:#ffffff; padding:30px; border-radius:12px; box-shadow:0 0 20px rgba(0,0,0,0.3);">
    <div style="text-align:center; margin-bottom:30px;">
      <h1 style="margin:20px 0 10px; color:#facc15;">Black Stone Voice Chat Room</h1>
      <p style="font-size:16px; color:#ccc;">Welcome to the Community!</p>
    </div>

    <p style="font-size:16px;">Hi <strong>${name}</strong> 👋,</p>

    <p style="font-size:16px; line-height:1.8;">
      We’re thrilled to welcome you to <strong>Black Stone Voice Chat Room</strong>! You’ve just stepped into a space where real-time conversations bring people together from around the world.
    </p>

    <div style="background:#2d2d2d; padding:20px; border-radius:8px; margin:20px 0;">
      <ul style="list-style:none; padding:0; margin:0; color:#facc15;">
        <li style="margin-bottom:10px;">✅ You’ve successfully created your account.</li>
        <li style="margin-bottom:10px;">🎙 Explore public and private voice rooms.</li>
        <li style="margin-bottom:10px;">💬 Connect and make new friends instantly.</li>
      </ul>
    </div>

    <p style="font-size:16px; line-height:1.6;">
      Need help? Our support team is here for you — just reply to this email.
    </p>

    <div style="text-align:center; margin-top:40px;">
      <a href="https://blackstonevoicechatroom.online" style="display:inline-block; padding:12px 25px; background:#facc15; color:#1a1a1a; border-radius:8px; text-decoration:none; font-weight:bold; transition:background 0.3s;">🚀 Join Now</a>
    </div>

    <hr style="border:0; border-top:1px solid #333; margin:40px 0;">

    <p style="font-size:12px; color:#888;">
      🛡 Keep your login credentials safe. Never share your password with anyone.
    </p>

    <p style="font-size:12px; color:#555; text-align:center; margin-top:30px;">
      © ${new Date().getFullYear()} Black Stone Voice Chat Room. All rights reserved.
    </p>
  </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Account created successfully. Welcome email sent.",
      ui_id: nextUiId,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;