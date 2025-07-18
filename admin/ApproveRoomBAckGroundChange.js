const backgrounderChanger = require('../schema/BackGrounChangeApply');
const Room = require('../schema/RoomsApi-Schema');
const users = require('../schema/account-create');

const applyBackgroundChange = async (req, res) => {
    try {
        const { requestId, action } = req.body;

        if (!requestId || !action) {
            return res.status(400).json({ error: "Missing requestId or action (approve/reject)" });
        }

        const findRequest = await backgrounderChanger.findById(requestId);
        if (!findRequest) {
            return res.status(404).json({ error: "Request not found" });
        }

        if (findRequest.status !== "pending") {
            return res.status(400).json({ error: "This request has already been processed" });
        }

        // Handle rejection
        if (action === "reject") {
            findRequest.status = "rejected";
            await findRequest.save();
            return res.status(200).json({ message: "Request rejected successfully" });
        }

        // Handle approval
        if (action === "approve") {
            const room = await Room.findOne({ roomId: findRequest.RoomId });
            if (!room) {
                return res.status(404).json({ error: "Room not found" });
            }

            const user = await users.findOne({ ui_id: findRequest.ui_id });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (user.gold < 4000) {
                return res.status(400).json({ error: "Insufficient gold balance (required: 4000)" });
            }

            // Deduct 4000 gold from user
            user.gold -= 4000;
            await user.save();

            // Update room background image
            room.roomImage = findRequest.backgroundImage;
            await room.save();

            // Approve the request
            findRequest.status = "approved";
            await findRequest.save();

            return res.status(200).json({ message: "Background change approved and applied successfully" });
        }

        return res.status(400).json({ error: "Invalid action. Use 'approve' or 'reject'" });

    } catch (error) {
        console.error("Error in applyBackgroundChange:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = applyBackgroundChange;
// This function handles the approval or rejection of background change requests.
// It checks if the request exists, if it is pending, and processes it accordingly.
// If approved, it deducts the required gold from the user and updates the room's background
