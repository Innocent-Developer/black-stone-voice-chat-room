const express = require("express");
const router = express.Router();
const Message = require("../schema/Message");
const Conversation = require("../schema/Conversation");
const User = require("../schema/account-create");
const auth = require("../middleware/authMiddleware");

// ----------------------------------------
// Send a direct message (with auth)
// ----------------------------------------
router.post("/send", async (req, res) => {
  const { senderId,receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res
      .status(400)
      .json({ message: "Receiver and content are required" });
  }

  try {
    const message = new Message({
      senderId,
      receiverId,
      content,
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
});

// ----------------------------------------
// Get messages between authenticated user and another user
// ----------------------------------------
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
    res
      .status(500)
      .json({ message: "Failed to fetch conversation", error: err.message });
  }
});

// ----------------------------------------
// Create or get a conversation
// ----------------------------------------
router.post("/conversations", async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({ members: [senderId, receiverId] });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get/create conversation",
      error: err.message,
    });
  }
});

// ----------------------------------------
// Send a message within a conversation
// ----------------------------------------
router.post("/messages", async (req, res) => {
  const { conversationId, senderId, content } = req.body;

  try {
    const message = new Message({ conversationId, senderId, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
});

// ----------------------------------------
// Get messages in a conversation
// ----------------------------------------
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get messages", error: err.message });
  }
});

// ----------------------------------------
// Get full chat history between two users
// ----------------------------------------
router.get("/history/:user1Id/:user2Id", async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    const conversation = await Conversation.findOne({
      members: { $all: [user1Id, user2Id] },
    });

    if (!conversation) {
      return res.status(404).json({ message: "No conversation found." });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 });

    res.status(200).json({ conversationId: conversation._id, messages });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch chat history", error: err.message });
  }
});

// ----------------------------------------
// Delete a single message
// ----------------------------------------
router.delete("/messages-delete", async (req, res) => {
  const { messageId } = req.body;

  try {
    const deleted = await Message.findByIdAndDelete(messageId);

    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting message", error: err.message });
  }
});

// ----------------------------------------
// Delete all messages in a conversation
// ----------------------------------------
router.delete("/conversations/:conversationId/messages", async (req, res) => {
  try {
    await Message.deleteMany({ conversationId: req.params.conversationId });
    res.status(200).json({ message: "All messages deleted in conversation" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting messages", error: err.message });
  }
});

// ----------------------------------------
// Delete an entire conversation and its messages
// ----------------------------------------
router.delete("/conversations/:conversationId", async (req, res) => {
  try {
    await Message.deleteMany({ conversationId: req.params.conversationId });
    await Conversation.findByIdAndDelete(req.params.conversationId);

    res.status(200).json({ message: "Conversation and all messages deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting conversation", error: err.message });
  }
});

// ----------------------------------------
// Send a message from admin to all users
// ----------------------------------------
router.post("/admin/send", auth, async (req, res) => {
  const { title, content, image } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const users = await User.find({ _id: { $ne: req.user.id } });

    const messages = await Promise.all(
      users.map(async (u) => {
        const message = new Message({
          senderId: req.user.id,
          receiverId: u._id,
          title,
          content,
          image,
        });
        return await message.save();
      })
    );

    res.status(201).json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
});
  router.get("/admin/get/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ senderId: req.user.id });
    res.status(200).json(messages);
  } catch (err) {
    res
    .status(500)
    .json({ message: "Failed to fetch messages", error: err.message });
  }
  });
  
  // ----------------------------------------
// Get all messages where the user is sender or receiver
// ----------------------------------------
router.get("/user/all-messages", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ timestamp: -1 }); // most recent first

    res.status(200).json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user's messages", error: err.message });
  }
});

module.exports = router;
