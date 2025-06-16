const User = require("../schema/account-create");
const Chat = require("../schema/chat");
const Message = require("../schema/Message");

/**
 * Broadcast a message from the admin to all users using `ui_id`
 * @param {Number} adminUiId - Custom UI ID of the admin (e.g., 5001)
 * @param {String} message - Message to send
 * @param {Object} io - Socket.IO server instance
 */
const sendAdminBroadcast = async (adminUiId, message, io) => {
  try {
    // Find admin user
    const admin = await User.findOne({ ui_id: adminUiId });
    if (!admin) {
      console.error("Admin user not found");
      return;
    }

    // Get all users except admin
    const users = await User.find({ ui_id: { $ne: adminUiId }, role: "user" });

    for (const user of users) {
      // Find or create chat
      let chat = await Chat.findOne({
        participants: { $all: [admin._id.toString(), user._id.toString()] },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [admin._id.toString(), user._id.toString()],
        });
      }

      // Create message
      const newMsg = await Message.create({
        chat: chat._id,
        sender: admin._id,
        message,
      });

      // Emit message if user is online
      const socketId = io.onlineUsers?.get(user.ui_id);
      if (socketId) {
        io.to(socketId).emit("receive_message", {
          ...newMsg._doc,
          chat: chat._id,
        });
      }
    }

    console.log("✅ Broadcast sent to all users.");
  } catch (err) {
    console.error("❌ Error broadcasting message:", err);
  }
};

module.exports = sendAdminBroadcast;
