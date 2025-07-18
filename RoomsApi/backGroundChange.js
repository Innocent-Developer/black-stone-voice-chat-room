const backgrounderChanger = require('../schema/BackGrounChangeApply');
const Room = require('../schema/RoomsApi-Schema');
const users = require('../schema/account-create');

const applyBackgroundChange = async (req, res) => {
    try {
        const {roomId,ui_id,backgroundImage} = req.body;
        if (!roomId || !ui_id || !backgroundImage) {
            return res.status(400).json({ error: "All fields are required" });
        };
        const user = await users.findOne({ ui_id });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        };
        const room = await Room.find({roomId});
        if(!room){
            return res.status(404).json({
                error: "Room not found"
            })
        };
        if(user.gold <4000){
            return res.status(400).json({ error: "You need at least 4000 gold to apply for background change" });
        };
        const existingApplication = await backgrounderChanger.findOne({ ui_id, RoomId: roomId });
        if (existingApplication) {
            return res.status(400).json({ error: "You have already applied for this room" });
        };
        const newApplication = new backgrounderChanger({
            ui_id,
            RoomId: roomId,
            backgroundImage,
        });
        await newApplication.save();
        return res.status(201).json({ message: "Background change application submitted successfully" });

        
    } catch (error) {
        console.log("Error in applyBackgroundChange:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }

}
module.exports = applyBackgroundChange;
// This function handles the application for changing the background of a room.
// It checks if the required fields are provided, verifies the user and room existence,
// and ensures that the user has not already applied for the same room.
// If all checks pass, it creates a new application and saves it to the database.
