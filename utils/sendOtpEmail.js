const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587, // Use TLS (STARTTLS)
    secure: false,
    auth: {
      user: process.env.MAIL, // support@blackstonevoicechatroom.online
      pass: process.env.MAIL_PASSWORD,
    },
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: `"Black Stone Voice Chat" <${process.env.MAIL}>`,
    replyTo: process.env.MAIL,
    to: email,
    subject: "Your OTP Code for Black Stone",
    text: `Hi,\n\nYour OTP code is: ${otp}\nIt expires in 5 minutes.\n\nThanks,\nBlack Stone Voice Chat Team`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <div style="text-align: center;">
            <img src="https://res.cloudinary.com/dha65z0gy/image/upload/v1750568548/banners/g8682gvbhfutdriyrysw.jpg" alt="Black Stone Logo" width="80" />
          </div>
          <h2 style="text-align: center; color: #333;">Your Verification Code</h2>
          <p style="text-align: center; color: #555;">Use the following OTP to verify your email:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; background: #007BFF; color: white; padding: 12px 24px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="text-align: center; color: #777;">This code is valid for 5 minutes.</p>
          <br/>
          <p style="text-align: center; font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} Black Stone Voice Chat</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    throw new Error("Failed to send OTP email.");
  }
};

module.exports = sendOtpEmail;
