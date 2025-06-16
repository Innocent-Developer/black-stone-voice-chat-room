const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "accountcreates" },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
