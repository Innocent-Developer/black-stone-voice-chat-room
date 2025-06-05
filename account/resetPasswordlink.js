const nodemailer = require("nodemailer");
const AccountCreate = require("../schema/account-create");
const dotenv = require("dotenv");
dotenv.config();

const passwordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find user by email
    const user = await AccountCreate.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP and expiration
    user.resetPasswordOtp = otp;
    user.otpExpiration = expiration;
    await user.save();

    // ✅ Configure transporter for Namecheap Private Email (not Gmail)
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com", // Namecheap's SMTP server
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL,          // e.g., no-reply@blackstonevoicechatroom.online
        pass: process.env.MAIL_PASSWORD, // your email password
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #ddd;">
        <h2 style="text-align: center; color: #000;">🔒 Password Reset Request - Black Stone Voice Chat Room</h2>
        <hr style="margin: 20px 0;">
        <p style="font-size: 16px; color: #333;"><strong>Black Stone Voice Chat Room</strong><br/>Password Reset Request</p>
        <p style="font-size: 15px; color: #444;">We received a request to reset your password.<br>If you made this request, please use the One-Time Password (OTP) below to proceed.</p>
        <div style="margin: 20px 0; text-align: center;">
          <p style="font-size: 18px; color: #000;">🔐 <strong>Your OTP Code:</strong></p>
          <h1 style="font-size: 40px; color: #4A90E2;">${otp}</h1>
          <p style="font-size: 14px; color: #888;">🕒 This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #D9534F;">🚫 Don't share this code with anyone, not even Black Stone support.</p>
        </div>
        <p style="font-size: 14px; color: #666;">If you did not request this password reset, please ignore this email.</p>
        <br>
        <p style="font-size: 14px; color: #333;">Thank you,<br/>Black Stone Voice Chat Room Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Black Stone Support" <${process.env.MAIL}>`,
      to: email,
      subject: "🔒 Password Reset Request - Black Stone Voice Chat Room",
      html: htmlContent,
    });

    res.status(200).json({ message: `OTP sent to your email.  ${email}` });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = passwordResetOtp;
