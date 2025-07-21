const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL, // e.g., support@yourdomain.com
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Black Stone Voice Chat" <${process.env.MAIL}>`,
    to: email,
    subject: "🔐 Your OTP Code for Black Stone Voice Chat",
    text: `Your OTP code is: ${otp}. It is valid for 5 minutes. Please do not share this code with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f9f9f9; border: 1px solid #ddd;">
        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/dha65z0gy/image/upload/v1750568548/banners/g8682gvbhfutdriyrysw.jpg" alt="Black Stone Logo" style="width: 120px; margin-bottom: 20px;" />
        </div>
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p style="font-size: 16px; color: #555; text-align: center;">
          Use the following code to verify your email address:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; letter-spacing: 4px; background: #007BFF; color: white; padding: 10px 20px; border-radius: 6px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center;">
          This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
        </p>
        <hr style="margin: 30px 0;" />
        <p style="text-align: center; font-size: 12px; color: #bbb;">
          © ${new Date().getFullYear()} Black Stone Voice Chat — All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email.");
  }
};

module.exports = sendOtpEmail;
