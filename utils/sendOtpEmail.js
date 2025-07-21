const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL, // support@blackstonevoicechatroom.online
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Black Stone Voice Chat Support" <${process.env.MAIL}>`,
    to: email,
    subject: "Your OTP Code - Black Stone Voice Chat",
    text: `Hello,

Your OTP code is: ${otp}

This code is valid for 5 minutes. Please do not share it with anyone.

Thanks,
Black Stone Voice Chat Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>OTP Email</title>
        </head>
        <body style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <div style="text-align: center;">
              <img src="https://res.cloudinary.com/dha65z0gy/image/upload/v1750568548/banners/g8682gvbhfutdriyrysw.jpg" alt="Black Stone Logo" width="100" style="margin-bottom: 20px;" />
            </div>
            <h2 style="text-align: center; color: #333;">Verify Your Email</h2>
            <p style="text-align: center; color: #555; font-size: 16px;">
              Use the OTP code below to verify your email address:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 30px; font-weight: bold; letter-spacing: 6px; background: #007BFF; color: #ffffff; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                ${otp}
              </span>
            </div>
            <p style="text-align: center; color: #888; font-size: 14px;">
              This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="text-align: center; font-size: 12px; color: #aaa;">
              © ${new Date().getFullYear()} Black Stone Voice Chat — All rights reserved.
            </p>
          </div>
        </body>
      </html>
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
