const nodemailer = require("nodemailer");
const CoinPurchaseRequest = require("../schema/CoinPurchaseRequest");
const Merchant = require("../schema/merchantschema");
const admin = require("../fireBase/firebase"); // Firebase Admin SDK

// ✅ Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

// ✅ Send email utility
const sendEmail = async (to, subject, htmlContent) => {
  await transporter.sendMail({
    from: `"blackstonevoicechatroom" <${process.env.MAIL}>`,
    to,
    subject,
    html: htmlContent,
  });
};

// ✅ Send FCM notification
const sendFCM = async (token, title, body) => {
  if (!token) return;

  try {
    const response = await admin.messaging().send({
      token,
      notification: { title, body },
    });
    console.log("✅ FCM sent:", response);
  } catch (error) {
    console.error("❌ FCM error:", error.code);
    if (error.code === 'messaging/registration-token-not-registered') {
      console.warn("🚫 Invalid FCM token");
      // Optional: remove token from DB if needed
    }
  }
};

// ✅ Main controller
const approveCoinPurchase = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
      return res.status(400).json({ message: "requestId and action are required." });
    }

    const request = await CoinPurchaseRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed." });
    }

    const merchant = await Merchant.findOne({ ui_id: request.ui_id });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found." });
    }

    if (action === "approve") {
      merchant.coinBalance = (merchant.coinBalance || 0) + request.coinAmount;
      await merchant.save();

      request.status = "approved";
      await request.save();

      const approvalHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #f9f9f9;">
          <h2 style="color: #4CAF50;">Coin Purchase Approved</h2>
          <p>Dear <strong>${merchant.merchantName}</strong>,</p>
          <p>Your request to purchase <strong>${request.coinAmount} coins</strong> has been <span style="color:green;">approved</span>.</p>
          <p><strong>Transaction Details:</strong></p>
          <ul>
            <li>Transaction Hash: ${request.transactionHash}</li>
            <li>Payment Method: ${request.paymentMethod}</li>
            <li>Amount Paid: $${request.payPrice}</li>
          </ul>
          <p>Your new coin balance is: <strong>${merchant.coinBalance}</strong></p>
          <p>Thank you for your purchase!</p>
          <hr />
          <p style="font-size: 12px; color: #666;">If you have any questions, please contact support.</p>
        </div>
      `;

      await sendEmail(merchant.merchantEmail, "Your Coin Purchase Request Approved", approvalHtml);

      // ✅ Send FCM to merchant
      await sendFCM(
        merchant.deviceToken,
        "Coin Purchase Approved",
        `Your ${request.coinAmount} coin purchase has been approved.`
      );

      return res.status(200).json({
        message: "Request approved, balance updated, email and notification sent.",
      });

    } else if (action === "reject") {
      request.status = "rejected";
      await request.save();

      const rejectHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fff0f0;">
          <h2 style="color: #D32F2F;">Coin Purchase Rejected</h2>
          <p>Dear <strong>${merchant.merchantName}</strong>,</p>
          <p>We regret to inform you that your request to purchase <strong>${request.coinAmount} coins</strong> has been <span style="color:red;">rejected</span>.</p>
          <p><strong>Transaction Details:</strong></p>
          <ul>
            <li>Transaction Hash: ${request.transactionHash}</li>
            <li>Payment Method: ${request.paymentMethod}</li>
            <li>Amount Paid: $${request.payPrice}</li>
          </ul>
          <p>Please contact our support team for more information.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">We're here to help you.</p>
        </div>
      `;

      await sendEmail(merchant.merchantEmail, "Your Coin Purchase Request Rejected", rejectHtml);

      // ✅ Send FCM rejection notice
      await sendFCM(
        merchant.deviceToken,
        "Coin Purchase Rejected",
        `Your ${request.coinAmount} coin purchase has been rejected.`
      );

      return res.status(200).json({ message: "Request rejected, email and notification sent." });
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }

  } catch (error) {
    console.error("❌ Error approving request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = approveCoinPurchase;
