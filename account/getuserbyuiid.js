const AccountCreate = require("../schema/account-create");

const getUserUIID = async (req, res) => {
    try {
        const ui_id = req.params.ui_id;

        if (!ui_id || typeof ui_id !== 'string') {
            return res.status(400).json({ message: "Invalid UI ID provided." });
        }

        const user = await AccountCreate.findOne({ ui_id });
        if (!user) {
            console.warn(`User with UI ID ${ui_id} not found`);
            return res.status(404).json({ message: "User not found." });
        }

        const { password, resetPasswordOtp, otpExpiration, ...safeUserData } = user.toObject();
        res.status(200).json(safeUserData);
        console.log(`User with UI ID ${ui_id} fetched successfully`);
    } catch (error) {
        console.error("Error fetching user by UI ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = getUserUIID;