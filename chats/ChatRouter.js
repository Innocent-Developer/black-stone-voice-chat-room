const express = require("express");
const router = express.Router();
const Message = require("../schema/Message");
const auth = require("../middleware/authMiddleware");
const Conversation = require("../schema/Conversation");

// Send a message
router.post("/send", auth, async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res
      .status(400)
      .json({ message: "Receiver and content are required" });
  }

  try {
    const message = new Message({
      senderId: req.user.id,
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

// Get messages between current user and another user
// routes/chat.js
router.get("/conversation/:receiverId", auth, async (req, res) => {
  const receiverId = req.params.receiverId;

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

// POST /api/messages
// body: { conversationId, senderId, content }

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

// GET /api/messages/:conversationId

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
router.get("/history/:user1Id/:user2Id", async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    // Find the conversation between both users
    const conversation = await Conversation.findOne({
      members: { $all: [user1Id, user2Id] },
    });

    if (!conversation) {
      return res.status(404).json({ message: "No conversation found." });
    }

    // Find all messages in that conversation
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 }); // oldest to newest

    res.status(200).json({ conversationId: conversation._id, messages });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch chat history", error: err.message });
  }
});

// delet chats
// Delete a Single Message
router.delete("/messages-delete/", async (req, res) => {
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

// Delete All Messages in a Conversation
router.delete("/conversations/:conversationId/messages", async (req, res) => {
  const { conversationId } = req.params;

  try {
    await Message.deleteMany({ conversationId });
    res.status(200).json({ message: "All messages deleted in conversation" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting messages", error: err.message });
  }
});

// Delete a Conversation (and all its messages)
router.delete("/conversations/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  try {
    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: "Conversation and all messages deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting conversation", error: err.message });
  }
});

module.exports = router;
