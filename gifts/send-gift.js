// ✅ Import firebase admin FIRST
const admin = require("../fireBase/firebase");
const AccountCreate = require("../schema/account-create");
// ✅ Import gift records creation function
const CreateGiftRecords = require("../gifts/CreateGiftRecords");

const sendGift = async (req, res) => {
  try {
    const { sender, receiver, amount } = req.body;

    // Find both accounts
    const senderAccount = await AccountCreate.findOne({ ui_id: sender });
    const receiverAccount = await AccountCreate.findOne({ ui_id: receiver });

    // Validate users
    if (!senderAccount || !receiverAccount) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    // Validate balance
    if (senderAccount.gold < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update balances
    senderAccount.gold -= amount;
    receiverAccount.diamond += amount;

    // Save to DB
    await senderAccount.save();
    await receiverAccount.save();

    // ✅ Create gift record using the helper function
    const giftRecord = await CreateGiftRecords({
      giftCode: Math.floor(Math.random() * 1000000), // Random 6-digit code
      amount,
      senderId: senderAccount.ui_id,
      receiverId: receiverAccount.ui_id,
    });
    console.log("🎁 Gift record created:", giftRecord);

    // ✅ Function to send FCM notification with error handling
    const sendNotification = async (user, title, body) => {
      const token = user.deviceToken;
      if (!token) {
        console.warn(`⚠️ No device token for ${user.userName}`);
        return;
      }

      try {
        const response = await admin.messaging().send({
          token,
          notification: {
            title,
            body,
          },
        });

        console.log(`✅ Notification sent to ${user.userName}:`, response);
      } catch (error) {
        console.error(`❌ Notification failed for ${user.userName}:`, error.code);

        // Optional: Handle invalid token
        if (error.code === 'messaging/registration-token-not-registered') {
          user.deviceToken = null;
          await user.save();
          console.warn(`🚫 Removed invalid token for ${user.userName}`);
        }
      }
    };

    // Send notifications
    await sendNotification(
      senderAccount,
      "Gift Sent! 🎁",
      `You sent ${amount} gold to ${receiverAccount.userName || 'a user'}.`
    );

    await sendNotification(
      receiverAccount,
      "You Received a Gift! 💎",
      `${senderAccount.userName || 'A user'} sent you ${amount} diamonds.`
    );

    res.json({ message: "Gift sent and notifications dispatched." });
  } catch (error) {
    console.error("💥 Send gift error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = sendGift;
