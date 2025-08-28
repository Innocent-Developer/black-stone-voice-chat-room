const express = require("express");
const router = express.Router();
const Message = require("../schema/Message");
const Conversation = require("../schema/Conversation");
const User = require("../schema/account-create");
const auth = require("../middleware/authMiddleware");

// Utility function for error handling
const handleError = (res, error, defaultMessage = "An error occurred") => {
  console.error(error);
  res.status(500).json({
    message: defaultMessage,
    error: error.message
  });
};

// ----------------------------------------
// MESSAGE ENDPOINTS
// ----------------------------------------

// Send a direct message
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

    const message = new Message({
      senderId: req.user.id,
      receiverId,
      content,
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

    await message.remove();
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
      members: req.user.id
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
      members: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found or unauthorized"
      });
    }

    await Message.deleteMany({ conversationId: req.params.conversationId });
    await conversation.remove();

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

module.exports = router;