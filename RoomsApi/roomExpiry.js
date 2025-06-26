// utils/roomExpiryJob.js
const Room = require('../schema/RoomsApi-Schema');

const checkExpiredRooms = async () => {
  try {
    const now = new Date();
    const expiredRooms = await Room.find({ expiresAt: { $lte: now } });

    for (const room of expiredRooms) {
      console.log(`Deleting expired room: ${room.roomName}`);
      await Room.deleteOne({ _id: room._id });
    }
  } catch (error) {
    console.error("Error checking expired rooms:", error.message);
  }
};

module.exports = checkExpiredRooms;
