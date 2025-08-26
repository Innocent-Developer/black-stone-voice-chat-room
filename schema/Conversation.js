const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountCreate',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountCreate'
  }]
}, {
  timestamps: true
});

// Ensure unique conversations between two users
conversationSchema.index({ members: 1 }, { unique: true });

// Update last message reference when new messages are added
conversationSchema.statics.updateLastMessage = async function (conversationId, messageId) {
  return this.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: messageId,
      $inc: { unreadCount: 1 }
    },
    { new: true }
  );
};

module.exports = mongoose.model('Conversation', conversationSchema);