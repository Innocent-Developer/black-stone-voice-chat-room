const User = require("../schema/account-create");
const Conversation = require("../schema/Conversation");
const Message = require("../schema/Message");

/**
 * Enhanced broadcast a message from the admin to all users using MongoDB ObjectId
 * @param {String} adminId - MongoDB ObjectId of the admin
 * @param {String} content - Message content to send
 * @param {String} title - Optional message title
 * @param {String} image - Optional image URL
 * @param {Object} io - Socket.IO server instance
 * @param {Array} targetUsers - Optional array of specific user IDs to target
 */
const sendAdminBroadcast = async (adminId, content, title = null, image = null, io = null, targetUsers = null) => {
  try {
    // Find admin user
    const admin = await User.findById(adminId);
    if (!admin) {
      console.error("❌ Admin user not found");
      return { success: false, error: "Admin user not found" };
    }

    // Determine target users
    let users;
    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      users = await User.find({
        _id: { $in: targetUsers },
        role: { $ne: "admin" }
      });
    } else {
      // Send to all users except admin
      users = await User.find({
        _id: { $ne: adminId },
        role: { $ne: "admin" }
      });
    }

    if (users.length === 0) {
      console.log("⚠️ No users found to send message to");
      return { success: false, error: "No users found to send message to" };
    }

    const sentMessages = [];

    for (const user of users) {
      try {
        // Find or create conversation
        let conversation = await Conversation.findOne({
          members: { $all: [admin._id, user._id] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            members: [admin._id, user._id],
          });
        }

        // Create message
        const newMsg = await Message.create({
          senderId: admin._id,
          receiverId: user._id,
          conversationId: conversation._id,
          content,
          title,
          image,
          isAdminBroadcast: true,
          messageType: image ? 'image' : 'text'
        });

        // Update conversation's last message
        await Conversation.updateLastMessage(conversation._id, newMsg._id);

        sentMessages.push(newMsg);

        // Emit message via Socket.IO if available and user is online
        if (io && io.onlineUsers) {
          const socketId = io.onlineUsers.get(user.ui_id);
          if (socketId) {
            io.to(socketId).emit("admin_broadcast", {
              ...newMsg._doc,
              senderInfo: {
                name: admin.name,
                username: admin.username,
                profilePicture: admin.profilePicture,
                role: admin.role
              }
            });
          }
        }
      } catch (userError) {
        console.error(`❌ Error sending message to user ${user._id}:`, userError);
      }
    }

    console.log(`✅ Broadcast sent to ${sentMessages.length} out of ${users.length} users.`);

    return {
      success: true,
      sentTo: sentMessages.length,
      totalUsers: users.length,
      messages: sentMessages
    };
  } catch (err) {
    console.error("❌ Error broadcasting message:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send a broadcast using ui_id (for backward compatibility)
 * @param {Number} adminUiId - Custom UI ID of the admin
 * @param {String} content - Message content to send
 * @param {Object} io - Socket.IO server instance
 * @param {String} title - Optional message title
 * @param {String} image - Optional image URL
 */
const sendAdminBroadcastByUiId = async (adminUiId, content, io = null, title = null, image = null) => {
  try {
    // Find admin user by ui_id
    const admin = await User.findOne({ ui_id: adminUiId });
    if (!admin) {
      console.error("❌ Admin user not found");
      return { success: false, error: "Admin user not found" };
    }

    return await sendAdminBroadcast(admin._id, content, title, image, io);
  } catch (err) {
    console.error("❌ Error broadcasting message:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get admin broadcast statistics
 * @param {String} adminId - MongoDB ObjectId of the admin
 */
const getAdminBroadcastStats = async (adminId) => {
  try {
    const totalBroadcasts = await Message.countDocuments({
      senderId: adminId,
      isAdminBroadcast: true
    });

    const unreadBroadcasts = await Message.countDocuments({
      senderId: adminId,
      isAdminBroadcast: true,
      read: false
    });

    const recentBroadcasts = await Message.countDocuments({
      senderId: adminId,
      isAdminBroadcast: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const totalUsers = await User.countDocuments({
      _id: { $ne: adminId },
      role: { $ne: "admin" }
    });

    return {
      totalBroadcasts,
      totalUsers,
      unreadBroadcasts,
      recentBroadcasts,
      readRate: totalBroadcasts > 0 ? ((totalBroadcasts - unreadBroadcasts) / totalBroadcasts * 100).toFixed(2) : 0
    };
  } catch (err) {
    console.error("❌ Error getting broadcast stats:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendAdminBroadcast,
  sendAdminBroadcastByUiId,
  getAdminBroadcastStats
};

// For backward compatibility, export the main function as default
module.exports.default = sendAdminBroadcast;
