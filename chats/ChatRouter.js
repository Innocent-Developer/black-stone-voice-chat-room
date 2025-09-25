const express = require("express");
const router = express.Router();
const Message = require("../schema/Message");
const Conversation = require("../schema/Conversation");
const User = require("../schema/account-create");
const auth = require("../middleware/authMiddleware"); // <-- Import your middleware

// Utility function for error handling
const handleError = (res, error, defaultMessage = "An error occurred") => {
  console.error(error);
  res.status(500).json({
    message: defaultMessage,
    error: error.message
  });
};

// Utility function to get or create a conversation between two users
async function getOrCreateConversation(userId1, userId2) {
  let conversation = await Conversation.findOne({
    members: { $all: [userId1, userId2] },
  });
  if (!conversation) {
    conversation = new Conversation({ members: [userId1, userId2] });
    await conversation.save();
  }
  return conversation;
}

// ----------------------------------------
// MESSAGE ENDPOINTS
// ----------------------------------------

// Send a direct message (ensure conversationId is set)
router.post("/send", auth, async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({
      message: "Receiver ID and content are required"
    });
  }

  try {
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Ensure conversation exists
    const conversation = await getOrCreateConversation(req.user.id, receiverId);

    const message = new Message({
      senderId: req.user.id,
      receiverId,
      content,
      conversationId: conversation._id, // Ensure conversationId is set
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    handleError(res, err, "Failed to send message");
  }
});

// Get messages between authenticated user and another user
router.get("/conversation/:receiverId", auth, async (req, res) => {
  const { receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId },
        { senderId: receiverId, receiverId: req.user.id },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    handleError(res, err, "Failed to fetch conversation");
  }
});

// Get all messages where the user is sender or receiver
router.get("/user/all-messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ],
    }).sort({ timestamp: -1 });

    res.status(200).json(messages);
  } catch (err) {
    handleError(res, err, "Failed to fetch user's messages");
  }
});

// Delete a single message (only if user is sender)
router.delete("/messages/:messageId", auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      senderId: req.user.id
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found or unauthorized"
      });
    }

    await Message.deleteOne({ _id: req.params.messageId }); // Use deleteOne instead of remove
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    handleError(res, err, "Error deleting message");
  }
});

// ----------------------------------------
// CONVERSATION ENDPOINTS
// ----------------------------------------

// Create or get a conversation
router.post("/conversations", auth, async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required" });
  }

  try {
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      members: { $all: [req.user.id, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [req.user.id, receiverId]
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    handleError(res, err, "Failed to get/create conversation");
  }
});

// Get messages in a conversation (only if user is participant)
router.get("/messages/:conversationId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      members: { $in: [req.user.id] } // Fix: use $in for array membership
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found or unauthorized"
      });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    handleError(res, err, "Failed to get messages");
  }
});

// Get full chat history between two users
router.get("/history/:user2Id", auth, async (req, res) => {
  const { user2Id } = req.params;

  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.user.id, user2Id] },
    });

    if (!conversation) {
      return res.status(404).json({ message: "No conversation found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 });

    res.status(200).json({
      conversationId: conversation._id,
      messages
    });
  } catch (err) {
    handleError(res, err, "Failed to fetch chat history");
  }
});

// Delete an entire conversation and its messages
router.delete("/conversations/:conversationId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      members: { $in: [req.user.id] } // Fix: use $in for array membership
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found or unauthorized"
      });
    }

    await Message.deleteMany({ conversationId: req.params.conversationId });
    await Conversation.deleteOne({ _id: req.params.conversationId }); // Use deleteOne

    res.status(200).json({
      message: "Conversation and all messages deleted"
    });
  } catch (err) {
    handleError(res, err, "Error deleting conversation");
  }
});

// ----------------------------------------
// ADMIN ENDPOINTS
// ----------------------------------------

// Send a message from admin to all users
router.post("/admin/send", auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { title, content, image } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const users = await User.find({ _id: { $ne: req.user.id } });

    const messages = await Promise.all(
      users.map(async (user) => {
        const message = new Message({
          senderId: req.user.id,
          receiverId: user._id,
          title,
          content,
          image,
          isAdminBroadcast: true
        });
        return await message.save();
      })
    );

    res.status(201).json(messages);
  } catch (err) {
    handleError(res, err, "Failed to send admin message");
  }
});

// Get all admin messages
router.get("/admin/messages", auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const messages = await Message.find({
      senderId: req.user.id,
      isAdminBroadcast: true
    }).sort({ timestamp: -1 });

    res.status(200).json(messages);
  } catch (err) {
    handleError(res, err, "Failed to fetch admin messages");
  }
})

// Send broadcast message from admin to all users
router.post("/admin/broadcast", async (req, res) => {
  try {
 
    const { title, content, image,id } = req.body;
      const user = await User.findById(id);

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Get all users except admin
    const users = await User.find({ 
      _id: { $ne:id },
      role: { $ne: 'admin' }
    });

    // Create broadcast messages for all users
    const messages = await Promise.all(users.map(async (user) => {
      const message = new Message({
        senderId: id,
        receiverId: user._id,
        title,
        content,
        image, // Add image support
        isAdminBroadcast: true
      });
      return await message.save();
    }));

    res.status(201).json({
      message: "Broadcast sent successfully",
      recipientCount: messages.length
    });

  } catch (err) {
    console.error("Broadcast error:", err);
    handleError(res, err, "Failed to send broadcast message");
  }
});

// Get admin broadcasts for regular users
router.get("/broadcasts", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      receiverId: req.user.id,
      isAdminBroadcast: true
    })
    .sort({ timestamp: -1 })
    .populate('senderId', 'username'); // Assuming you want sender's username

    res.status(200).json(messages);
  } catch (err) {
    handleError(res, err, "Failed to fetch broadcast messages");
  }
});

// ----------------------------------------
// GET LAST MESSAGE BETWEEN TWO USERS
// ----------------------------------------
router.get("/last-message/:user2Id", auth, async (req, res) => {
  const { user2Id } = req.params;
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.user.id, user2Id] },
    });

    if (!conversation) {
      return res.status(404).json({ message: "No conversation found" });
    }

    const lastMessage = await Message.findOne({
      conversationId: conversation._id,
    }).sort({ timestamp: -1 }); // Get the latest message

    if (!lastMessage) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.status(200).json(lastMessage);
  } catch (err) {
    handleError(res, err, "Failed to fetch last message");
  }
});

// Example: Protect a route
router.get("/protected-route", auth, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

module.exports = router;