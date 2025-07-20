const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    default: null, // allow direct messages without conversation
  },
  senderId: {
    type: mongoose.Schema.Types.Mixed, // allows Number or ObjectId for flexibility
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.Mixed, // allows Number or ObjectId
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
    type: String, // e.g., Cloudinary or Uploadcare URL
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

// Optional: Ensure a compound index for fast querying between users
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

module.exports = mongoose.model("Message", messageSchema);
