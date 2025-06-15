const Merchant = require("../schema/merchantschema");
const nodemailer = require("nodemailer");

const approveMerchant = async (req, res) => {
  try {
    const { merchantId } = req.body;

    const merchant = await Merchant.findOne({ ui_id: Number(merchantId) });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found." });
    }
    if(merchant.status === "approved") {
      return res.status(400).json({
        massege:'Already Merchant Approve'
      })
    };
    if(merchant.status ==="rejected"){
      return res.status(400).json({
        massege:'Already Merchant Reject Please Try With New Account'
      })
    };

    merchant.status = "approved";
    await merchant.save();

    // ✅ Send approval email
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Black Stone Voice Chat Room" <${process.env.MAIL}>`,
      to: merchant.merchantEmail,
      subject: "Merchant Application Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
         
          <h2 style="color: #27ae60; text-align: center;">Merchant Approved</h2>
          <p>Hi <strong>${merchant.merchantName}</strong>,</p>
          <p>Your merchant application has been <strong>approved</strong>.</p>
          <p><strong>Merchant ID:</strong> ${merchant.ui_id}</p>
          <p>You can now log in and start managing your services.</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://yourmerchantportal.com/login" style="background: #27ae60; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Go to Portal</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} Black Stone. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Merchant approved and email sent successfully.",
      data: merchant,
    });
  } catch (error) {
    console.error("Error approving merchant:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = approveMerchant;
