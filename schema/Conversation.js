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

// Validate members array at schema level
conversationSchema.path('members').validate(function (members) {
  return members.length === 2 && new Set(members.map(m => m.toString())).size === 2;
}, 'Conversation must have exactly 2 unique members');

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