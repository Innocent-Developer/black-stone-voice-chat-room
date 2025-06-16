const express = require("express");
const router = express.Router();
const Chat = require("../schema/chat");
const Message = require("../schema/Message");

// 1. Start or get existing chat session between admin and user
router.post("/start-session", async (req, res) => {
  const { adminId, userId } = req.body;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [adminId, userId] },
    });

    if (!chat) {
      chat = await Chat.create({ participants: [adminId, userId] });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Error creating chat session" });
  }
});

// 2. Get all messages for a chat
router.get("/messages/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// 3. Save message to DB
router.post("/send-message", async (req, res) => {
  const { chatId, senderId, message } = req.body;

  try {
    const msg = await Message.create({ chat: chatId, sender: senderId, message });
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
});

module.exports = router;
