const AccountCreate = require("../schema/account-create.js");
const Merchant = require("../schema/merchantschema");
const Transaction = require("../schema/transaction");

const sendCointouserbym = async (req, res) => {
    const { merchant_id, user_id, amount } = req.body;

    try {
        // validate request
        if (!merchant_id || !user_id || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        // find merchant and user
        const merchant = await Merchant.findOne({ ui_id: merchant_id });
        const user = await AccountCreate.findOne({ ui_id: user_id });

        if (!merchant || !user) {
            return res.status(404).json({ success: false, message: "Merchant or user not found" });
        }

        // check merchant balance
        if (merchant.balance < amount) {
            return res.status(400).json({ success: false, message: "Merchant does not have enough coins" });
        }

        // deduct from merchant
        merchant.coinBalance -= amount;
        await merchant.save();

        // add to user gold balance
        user.gold = (user.gold || 0) + amount;
        await user.save();

        // create transaction record
        const transaction = new Transaction({
            merchant_id: merchant._id,
            user_id: user._id,
            gold: amount,
            type: "merchant_to_user", // optional: track type
            createdAt: new Date()
        });
        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Coin sent to user successfully",
            data: {
                merchant_balance: merchant.balance,
                user_gold: user.goldBalance,
                transaction_id: transaction._id
            }
        });
    }
    catch (error) {
        console.error("Error in sendCointouserbym:", error);
        res.status(500).json({ success: false, message: "Error sending coin to user", error: error.message });
    }
};

module.exports = { sendCointouserbym };
