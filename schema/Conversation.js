const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  members: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountCreate'
    }],
    validate: {
      validator: function(members) {
        // Check if array has exactly 2 members and they are unique
        return members.length === 2 && new Set(members.map(m => m.toString())).size === 2;
      },
      message: 'Conversation must have exactly 2 unique members'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);