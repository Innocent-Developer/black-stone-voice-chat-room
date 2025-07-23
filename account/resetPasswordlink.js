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
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center;">
        <img src="https://www.funchatparty.online/logo.jpeg" alt="Fun Chat Party Banner" style="max-width: 120px; margin-bottom: 20px;" />
      </div>
      <h2 style="text-align: center; color: #333;">🔒 Password Reset Request - Fun Chat Party</h2>
      <hr style="margin: 20px 0;">
      <p style="text-align: center; color: #555; font-size: 16px;">
        Hello! 👋<br/>
        We received a request to reset your password for <strong>Fun Chat Party</strong>.<br/>
        If this was you, please use the One-Time Password (OTP) below to proceed.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 28px; font-weight: bold; background: #ff4081; color: white; padding: 12px 24px; border-radius: 10px;">
          ${otp}
        </span>
        <p style="font-size: 14px; color: #888; margin-top: 10px;">🕒 This code will expire in 10 minutes.</p>
        <p style="font-size: 14px; color: #D9534F;">🚫 Please do not share this code with anyone, not even Fun Chat Party support.</p>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">If you did not request this password reset, please ignore this email.</p>
      <br/>
      <p style="text-align: center; color: #555;">Thanks for being a part of the <strong>Fun Chat Party</strong> community! 🎉</p>
      <p style="text-align: center; color: #999; font-size: 14px;">Need help? Our support team is here for you.</p>
      <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 40px;">
        © ${new Date().getFullYear()} Fun Chat Party<br/>
        📱 Let's Chat. Let's Party.
      </p>
    </div>
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
