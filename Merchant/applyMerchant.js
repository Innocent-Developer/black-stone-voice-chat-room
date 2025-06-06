const Merchant = require("../schema/merchantschema");
const AccountCreate = require("../schema/account-create"); // ✅ Import the AccountCreate schema
const nodemailer = require("nodemailer");

const applyMerchant = async (req, res) => {
  try {
    const {
      merchantName,
      merchantAddress,
      merchantPhoneNumber,
      merchantEmail,
      merchantLogoUrl,
    } = req.body;

    // 🔍 Check if the merchantEmail exists in AccountCreate
    const account = await AccountCreate.findOne({ email: merchantEmail });

    if (!account) {
      return res.status(403).json({
        message: "Only registered users can apply as merchants.",
      });
    }

    // ✅ Validate required fields
    if (
      !merchantName ||
      !merchantAddress ||
      !merchantPhoneNumber ||
      !merchantEmail
    ) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    // ✅ Check if merchant already exists
    const existingMerchant = await Merchant.findOne({
      $or: [{ merchantEmail }, { merchantPhoneNumber }],
    });

    if (existingMerchant) {
      return res.status(409).json({
        message: "Merchant with this email or phone already exists.",
      });
    }

    // ✅ Generate next ui_id
    const lastMerchant = await Merchant.findOne().sort({ ui_id: -1 });
    const ui_id =
      lastMerchant && lastMerchant.ui_id ? lastMerchant.ui_id + 1 : 30001;

    // ✅ Create new merchant
    const newMerchant = new Merchant({
      ui_id,
      merchantName,
      merchantAddress,
      merchantPhoneNumber,
      merchantEmail,
      merchantLogoUrl,
    });

    await newMerchant.save();
    // Send confirmation email
    // Set up your SMTP transporter (use your email service credentials)
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Email content with simple HTML and the unique UI id
    const mailOptions = {
      from: `"Black Stone Voice Chat Room" <${process.env.MAIL}>`,
      to: merchantEmail,
      subject: "Merchant Application Received",
      html: `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 30px; color: #1a1a1a;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://i.ibb.co/vCmyL1gJ/logo.jpg" alt="Company Logo" style="width: 100px; filter: drop-shadow(0 0 2px rgba(42, 157, 244, 0.6));" />
    </div>
    <h1 style="font-weight: 700; font-size: 26px; color: #2a9df4; text-align: center; margin-bottom: 20px;">
      Merchant Application Submitted!
    </h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
      Hello <strong>${merchantName}</strong>,<br/>
      Thank you for applying as a merchant. We have received your application and your details are below:
    </p>

    <div style="background: #f3f6fb; border-radius: 10px; padding: 20px 25px; margin-bottom: 30px; box-shadow: inset 0 0 10px rgba(42, 157, 244, 0.15);">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Merchant ID</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: 700; color: #27ae60;">${ui_id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Status</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: 500; color:rgb(227, 43, 70);"> Pending</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Name</td>
          <td style="padding: 8px 0;">${merchantName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Email</td>
          <td style="padding: 8px 0;">${merchantEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Phone</td>
          <td style="padding: 8px 0;">${merchantPhoneNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Address</td>
          <td style="padding: 8px 0;">${merchantAddress}</td>
        </tr>
      </table>
    </div>

    <p style="text-align: center; font-size: 16px; margin-bottom: 35px;">
      Our team will review your application shortly. You will receive an update once it has been approved.
    </p>

    <div style="text-align: center;">
      <a href="mailto:no-reply@blackstonevoicechatroom.online"  target="_blank" style="background: #2a9df4; color: #fff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 30px; box-shadow: 0 4px 12px rgba(42, 157, 244, 0.4); transition: background 0.3s ease;">
        Contact Support
      </a>
    </div>

    <footer style="margin-top: 40px; font-size: 13px; color: #999; text-align: center;">
      &copy; ${new Date().getFullYear()} Black Stone Voice Chat Room. All rights reserved.
    </footer>
  </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message:
        "Merchant application submitted successfully. Confirmation email sent.",
      data: newMerchant,
    });
  } catch (error) {
    console.error("Error applying merchant:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = applyMerchant;
