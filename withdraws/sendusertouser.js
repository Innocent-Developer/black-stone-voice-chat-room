const mongoose = require("mongoose");
const AccountCreate = require("../schema/account-create.js");

const sendUserToUser = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { senderUiId, receiverUiId, amount } = req.body;

        // Validate input
        if (!senderUiId || !receiverUiId || !amount) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: "Invalid amount." });
        }

        await session.withTransaction(async () => {
            // Find sender and receiver within the session
            const sender = await AccountCreate.findOne({ ui_id: senderUiId }).session(session);
            if (!sender) {
                throw new Error("Sender not found.");
            }

            const receiver = await AccountCreate.findOne({ ui_id: receiverUiId }).session(session);
            if (!receiver) {
                throw new Error("Receiver not found.");
            }

            // Check balance
            if (sender.diamond < amount) {
                throw new Error("Insufficient balance.");
            }

            // Perform transfer
            sender.diamond -= Number(amount);
            receiver.diamond += Number(amount);

            // Save changes within transaction
            await sender.save({ session });
            await receiver.save({ session });

            // Optional transaction summary
            const transaction = {
                from: sender.ui_id,
                to: receiver.ui_id,
                amountTransferred: Number(amount),
                timestamp: new Date(),
            };

            res.status(201).json({
                message: "Transfer completed successfully.",
                sender: {
                    ui_id: sender.ui_id,
                    name: sender.name,
                    email: sender.email,
                    balance: sender.diamond,
                },
                receiver: {
                    ui_id: receiver.ui_id,
                    name: receiver.name,
                    email: receiver.email,
                    balance: receiver.diamond,
                },
                transaction,
            });
        });

    } catch (error) {
        console.error("Transaction failed:", error);
        res.status(500).json({ message: "Transfer failed", error: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = sendUserToUser;
