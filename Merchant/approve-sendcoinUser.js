const Merchant = require("../schema/merchantschema");
const AccountCreate = require("../schema/account-create");
const admin = require("firebase-admin");

const approveCoinsell = async (req, res) => {
  try {
    const { merchantId, userId, coinAmount } = req.body;

    if (!merchantId || !userId || !coinAmount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Fetch merchant and user
    const merchant = await Merchant.findOne({ ui_id: merchantId });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found." });
    }

    const user = await AccountCreate.findOne({ ui_id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate merchant coin balance
    if ((merchant.coinBalance || 0) < coinAmount) {
      return res
        .status(400)
        .json({ message: "Merchant does not have enough coins." });
    }

    // Update balances
    merchant.coinBalance = (merchant.coinBalance || 0) - coinAmount;
    user.gold = (user.gold || 0) + coinAmount;

    await merchant.save();
    await user.save();

    // Send push notification if valid device token exists
    if (
      user.deviceToken &&
      typeof user.deviceToken === "string" &&
      user.deviceToken.length >= 10
    ) {
      try {
        await admin.messaging().send({
          token: user.deviceToken,
          notification: {
            title: "🎁 Coins Received!",
            body: `You received ${coinAmount} coins from a merchant.`,
          },
          android: {
            notification: { sound: "default" },
          },
          apns: {
            payload: {
              aps: { sound: "default" },
            },
          },
        });
      } catch (pushError) {
        console.warn(
          "⚠️ Push notification skipped:",
          pushError.errorInfo?.message
        );
      }
    }

    return res.status(200).json({
      message: "Coins sent successfully.",
      merchantCoinBalance: merchant.coinBalance,
      userGold: user.gold,
    });
  } catch (error) {
    console.error("❌ Error in approveCoinsell:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = approveCoinsell;
