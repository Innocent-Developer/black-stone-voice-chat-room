const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com', // or the actual mail server (check Namecheap panel)
  port: 465, // use 587 for STARTTLS, 465 for SSL
  secure: true, // true for port 465, false for port 587
  auth: {
    user: process.env.MAIL, // e.g., 'support@yourdomain.com'
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // optional, may help with self-signed certs
  },
  logger: true,
  debug: true,
});


  const mailOptions = {
  from: '"chu chu Party" <otp@chuchuparty.online>',
  replyTo: 'otp@chuchuparty.online',
  to: email,
  subject: "🔐 Your chuchuparty Party OTP Code – Let’s Get the Fun Started!",
  text: `Hey there! 🎉

Welcome to  chu chu Party – where conversations meet excitement!

Your One-Time Password (OTP) is:

🔐 ${otp}
(This code is valid for the next 5 minutes.)

Use this to verify your account and start chatting with your favorite people in the most fun way possible! 🥳

Need help? Our support team is always here for you.

Stay connected,
Team Fun Chat Party
📱 Let's Chat. Let's Party.`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center;">
          <img src="https://www.funchatparty.online/logo.jpeg" alt="Fun Chat Party Banner" style="max-width: 120px; margin-bottom: 20px;" />
        </div>
        <h2 style="text-align: center; color: #333;">🔐 Your One-Time Password</h2>
        <p style="text-align: center; color: #555; font-size: 16px;">
          Hey there! 🎉<br/>
          Welcome to <strong>chu chu party</strong> – where conversations meet excitement!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 28px; font-weight: bold; background: #ff4081; color: white; padding: 12px 24px; border-radius: 10px;">
            ${otp}
          </span>
        </div>
        <p style="text-align: center; color: #777;">(This code is valid for the next 5 minutes.)</p>
        <br/>
        <p style="text-align: center; color: #555;">Use this to verify your account and start chatting with your favorite people in the most fun way possible! 🥳</p>
        <br/>
        <p style="text-align: center; color: #999; font-size: 14px;">Need help? Our support team is always here for you.</p>
        <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 40px;">
          © ${new Date().getFullYear()} Fun Chat Party<br/>
          📱 Let's Chat. Let's Party.
        </p>
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
