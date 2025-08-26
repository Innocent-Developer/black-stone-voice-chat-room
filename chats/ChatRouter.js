const express = require("express");
const router = express.Router();
const Message = require("../schema/Message");
const Conversation = require("../schema/Conversation");
const User = require("../schema/account-create");

// Simple error handling
const handleError = (res, error, message = "Error occurred") => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: message,
    error: error.message
  });
};

// ----------------------------------------
// SIMPLE USER CHAT ENDPOINTS
// ----------------------------------------

// Send a message
router.post("/send", async (req, res) => {
  const { senderId, receiverId, content, title, image } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({
      success: false,
      message: "senderId, receiverId and content are required"
    });
  }

  try {
    // Check if users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "Sender or receiver not found"
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // Validate members before creating
      if (senderId === receiverId) {
        return res.status(400).json({
          success: false,
          message: "Cannot send message to yourself"
        });
      }

      conversation = new Conversation({
        members: [senderId, receiverId]
      });

      try {
        await conversation.save();
      } catch (saveError) {
        if (saveError.code === 11000) {
          // Duplicate key error - conversation already exists
          conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] },
          });
        } else {
          throw saveError;
        }
      }
    }

    // Create message
    const message = new Message({
      senderId,
      receiverId,
      conversationId: conversation._id,
      content,
      title: title || null,
      image: image || null,
      isAdminBroadcast: false
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (err) {
    handleError(res, err, "Failed to send message");
  }
});

// Get messages between two users
router.get("/conversation/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .populate('senderId', 'name username profilePicture ui_id')
      .populate('receiverId', 'name username profilePicture ui_id')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
      }
    });
  } catch (err) {
    handleError(res, err, "Failed to get messages");
  }
});

// Get all conversations for a user
router.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await Conversation.find({
      members: userId
    })
      .populate('members', 'name username profilePicture ui_id')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations
    });
  } catch (err) {
    handleError(res, err, "Failed to get conversations");
  }
});

// Delete a message
router.delete("/message/:messageId/:userId", async (req, res) => {
  const { messageId, userId } = req.params;

  try {
    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or not authorized"
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (err) {
    handleError(res, err, "Failed to delete message");
  }
});

// ----------------------------------------
// SIMPLE ADMIN BROADCAST ENDPOINTS
// ----------------------------------------

// Send broadcast message
router.post("/admin/broadcast", async (req, res) => {
  const { adminId, title, content, image, targetUsers } = req.body;

  if (!adminId || !content) {
    return res.status(400).json({
      success: false,
      message: "adminId and content are required"
    });
  }

  try {
    // Find admin user
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Get target users
    let users;
    if (targetUsers && targetUsers.length > 0) {
      users = await User.find({ _id: { $in: targetUsers } });
    } else {
      users = await User.find({
        _id: { $ne: adminId },
        role: { $ne: "admin" }
      });
    }

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }

    const sentMessages = [];

    for (const user of users) {
      // Find or create conversation
      let conversation = await Conversation.findOne({
        members: { $all: [adminId, user._id] },
      });

      if (!conversation) {
        conversation = new Conversation({
          members: [adminId, user._id]
        });

        try {
          await conversation.save();
        } catch (saveError) {
          if (saveError.code === 11000) {
            // Duplicate key error - conversation already exists
            conversation = await Conversation.findOne({
              members: { $all: [adminId, user._id] },
            });
          } else {
            console.error(`Error creating conversation for user ${user._id}:`, saveError);
            continue; // Skip this user and continue with next
          }
        }
      }

      // Create broadcast message
      const message = new Message({
        senderId: adminId,
        receiverId: user._id,
        conversationId: conversation._id,
        title: title || null,
        content,
        image: image || null,
        isAdminBroadcast: true
      });

      await message.save();

      // Update conversation
      conversation.lastMessage = message._id;
      await conversation.save();

      sentMessages.push(message);
    }

    res.status(201).json({
      success: true,
      message: `Broadcast sent to ${sentMessages.length} users`,
      sentTo: sentMessages.length,
      totalUsers: users.length
    });
  } catch (err) {
    handleError(res, err, "Failed to send broadcast");
  }
});

// Get admin broadcasts
router.get("/admin/broadcasts/:adminId", async (req, res) => {
  const { adminId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      senderId: adminId,
      isAdminBroadcast: true
    })
      .populate('receiverId', 'name username ui_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      senderId: adminId,
      isAdminBroadcast: true
    });

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    handleError(res, err, "Failed to get broadcasts");
  }
});

// Get all users (for admin)
router.get("/admin/users/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    const users = await User.find(
      {
        _id: { $ne: adminId },
        role: { $ne: "admin" }
      },
      'name username profilePicture ui_id email createdAt'
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      total: users.length
    });
  } catch (err) {
    handleError(res, err, "Failed to get users");
  }
});

module.exports = router;