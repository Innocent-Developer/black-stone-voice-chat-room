// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    // required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AccountCreate",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AccountCreate",
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL string
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  seen: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Message", messageSchema);
