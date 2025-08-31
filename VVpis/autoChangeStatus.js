const VvpiUsers = require("../schema/vvpiusers");
const AccountCreate = require("../schema/account-create");
const HistoryVIPS = require("../schema/HistoryVIPS");

const autoChangeStatus = async () => {
    try {
        const currentDate = new Date();

        // Find all active VIPs that have expired
        const expiredVips = await HistoryVIPS.find({ expireDate: { $lt: currentDate } });

        for (const vip of expiredVips) {
            // Update the status of the expired VIP to 'expired'
            vip.status = 'expired';
            await vip.save();

            // Optionally, you can also update the user's account if needed
            const account = await AccountCreate.findOne({ ui_id: vip.ui_id });
            if (account) {
                account.userType = 'user'; // or any other logic based on your requirements
                await account.save();
            }
        }

        console.log(`Auto status update completed. Total expired VIPs updated: ${expiredVips.length}`);
    } catch (error) {
        console.error("Auto change status error:", error);
    }
};

// Schedule the function to run periodically (e.g., every   hour)
setInterval(autoChangeStatus, 60 * 60 * 1000); // every hour

module.exports = autoChangeStatus;