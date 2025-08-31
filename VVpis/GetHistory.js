const AccountCreate = require("../schema/account-create");
const HistoryVIPS = require("../schema/HistoryVIPS");

const getHistory = async (req, res) => {
    try {
        const { ui_id } = req.body;
        if (!ui_id) {
            return res.status(400).json({ message: "ui_id is required" });
        }

        const account = await AccountCreate.findOne({ ui_id });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        const history = await HistoryVIPS.find({ ui_id }).sort({ buyDate: -1 });

        return res.status(200).json({
            message: "History retrieved successfully",
            history,
        });

    } catch (error) {
        console.error("Get history error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = getHistory;