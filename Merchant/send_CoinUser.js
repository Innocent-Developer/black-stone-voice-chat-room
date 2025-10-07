const Merchant = require("../schema/merchantschema");
const AccountCreate = require("../schema/account-create");


// create a for send coin to user

const send_CoinUser = async (req, res) => {
    try {
        const { merchantId, userId, amount } = req.body;
        if (!merchantId || !userId || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const merchant = await Merchant.find({ ui_id: merchantId });
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }
        const user = await AccountCreate.find({ ui_id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        };
        if (merchant.coinBalance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        };
        merchant.coinBalance -= amount;
        user.gold += amount;
        await merchant.save();
        await user.save();

        res.status(201).json({ message: "Coins sent successfully" });
    } catch (error) {
        console.error("Error sending coins:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = send_CoinUser;