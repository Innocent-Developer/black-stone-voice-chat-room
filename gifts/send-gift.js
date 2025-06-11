const AccountCreate = require("../schema/account-create");

const sendGift = async (req, res) => {
  try {
    const { sender, receiver, amount } = req.body;
    const senderAccount = await AccountCreate.findOne({ ui_id: sender });
    const receiverAccount = await AccountCreate.findOne({ ui_id: receiver });
    if (!senderAccount || !receiverAccount) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }
    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    senderAccount.gold -= amount;
    receiverAccount.diamond += amount;
    await senderAccount.save();
    await receiverAccount.save();
    res.json({ message: "Gift sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = sendGift;
