const Withdrawal = require("../schema/withdrawal-schema");
const AccountCreate = require("../schema/account-create.js");

const sendUserToUser = async (req, res) => {
    try {
        const { senderUiId, receiverUiId, amount } = req.body;
        // Validate input
        if (!senderUiId || !receiverUiId || !amount) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Check if amount is a valid positive number
        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: "Invalid amount." });
        }
        // Check if sender exists
        const sender = await AccountCreate.findOne({ ui_id: senderUiId });
        if (!sender) {
            return res.status(404).json({ message: "Sender not found." });
        }
        // Check if receiver exists
        const receiver = await AccountCreate.findOne({ ui_id: receiverUiId });
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found." });
        }
        // Optional: Check if sender has enough balance (if balance tracking is implemented)
        if (sender.gold < amount) {
            return res.status(400).json({ message: "Insufficient balance." });
        }
        
        // cut coin from sender's account
        sender.gold -= amount;
        await sender.save();
        // Add coin to receiver's account
        receiver.gold += amount;
        await receiver.save();
        // Create withdrawal request
        const withdrawalRequest = new Withdrawal({
            senderUiId,
            receiverUiId,
            amount,
            status: "completed", // Optional: Default status
            completedAt: new Date(), // Optional: Timestamp
        });
        await withdrawalRequest.save();
        res.status(201).json({
            message: " transfer completed successfully.",
            sender: {
                ui_id: sender.ui_id,
                name: sender.name,
                email: sender.email,
            },
            receiver: {
                ui_id: receiver.ui_id,
                name: receiver.name,
                email: receiver.email,
            },
            request: withdrawalRequest,
        });
    } catch (error) {
        console.error("Error in sending user to user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = sendUserToUser;