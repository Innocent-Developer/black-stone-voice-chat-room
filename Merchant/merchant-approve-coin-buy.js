const buycoinMerchant = require("../schema/buycoinmerchent");
const AccountCreate = require("../schema/account-create.js");
const Merchant = require("../schema/merchantschema");
const admin = require("../fireBase/firebase"); // Firebase Admin SDK initialized

const approvebuycoin = async (req, res) => {
  const { ui_id, merchant_id, buycoin, status } = req.body;

  try {
    // Step 1: Validate input
    if (ui_id == null || merchant_id == null || buycoin == null) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Step 2: Find merchant
    const merchant = await Merchant.findOne({ ui_id: merchant_id });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant account not found." });
    }

    // Step 3: Find user
    const userAccount = await AccountCreate.findOne({ ui_id });
    if (!userAccount) {
      return res.status(404).json({ message: "User account not found." });
    }

    // Step 4: If approved, transfer coins
    if (status === "approved") {
      if ((merchant.coinBalance || 0) < buycoin) {
        return res
          .status(400)
          .json({ message: "Merchant does not have enough coins." });
      }

      // Transfer coins
      merchant.coinBalance -= buycoin;
      userAccount.gold = (userAccount.gold || 0) + buycoin;

      await merchant.save();
      await userAccount.save();

      // Step 4.1: Send notification to user (if token available)
      const token = userAccount.deviceToken;
      if (token) {
        try {
          const response = await admin.messaging().send({
            token,
            notification: {
              title: "Coin Purchase Approved 🎉",
              body: `Your purchase of ${buycoin} gold was approved.`,
            },
          });
          console.log("✅ Notification sent to user:", response);
        } catch (error) {
          console.error("❌ FCM send error:", error.code);

          // Optional: Remove invalid token from DB
          if (error.code === "messaging/registration-token-not-registered") {
            userAccount.deviceToken = null;
            await userAccount.save();
            console.warn("🚫 Invalid token removed from user.");
          }
        }
      } else {
        console.warn("⚠️ No deviceToken found for user.");
      }
    }

    // Step 5: Save transaction
    const newPurchase = new buycoinMerchant({
      ui_id,
      merchant_id,
      buycoin,
      status,
    });

    const savedPurchase = await newPurchase.save();

    return res.status(201).json({
      message: "Coin transaction processed successfully.",
      data: savedPurchase,
    });
  } catch (error) {
    console.error("❌ Error in approvebuycoin:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = approvebuycoin;
