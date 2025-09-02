const VvpiUsers = require("../schema/vvpiusers");
const AccountCreate = require("../schema/account-create");
const HistoryVIPS = require("../schema/HistoryVIPS");

const adminSendVvips = async (req, res) => {
    try {
        const { ui_id, id } = req.body;
        if (!ui_id || !id) {
            return res.status(400).json({ message: "ui_id and id are required" });
        }

        const vvpiItem = await VvpiUsers.findById(id);
        if (!vvpiItem) {
            return res.status(404).json({ message: "VVIPS item not found" });
        }

        const account = await AccountCreate.findOne({ ui_id });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Calculate expire date
        const buyDate = new Date();
        const expireDate = new Date(buyDate);
        expireDate.setDate(expireDate.getDate() + (vvpiItem.duration || vvpiItem.days || 30)); // fallback 30 days

        // Create history
        await HistoryVIPS.create({
            ui_id,
            vipTital: vvpiItem.vipTital,
            vipDescription: vvpiItem.vipDescription,
            vpiframe: vvpiItem.vpiframe,
            bubbleChat: vvpiItem.bubbleChat
            ,
            entarneentarneShow: vvpiItem.entarneentarneShow,
            price: 0, // Admin send, so price is 0
            days: vvpiItem.duration || vvpiItem.days,
            spicelGift: vvpiItem.spicelGift,
            profileheadware: vvpiItem.profileheadware,
            pic: vvpiItem.pic,
            buyDate,
            expireDate,
        });

        // update user type to vvips
        account.userType = "vvips";
        await account.save();

        return res.status(200).json({
            message: "VVIPS sent successfully",
            vvpiSent: vvpiItem.vipTital,
            expireDate,
        });
    } catch (error) {
        console.error("Admin send VVIPS error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = adminSendVvips;