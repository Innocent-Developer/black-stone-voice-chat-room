const mongoose = require("mongoose");

// Define the chat message schema FIRST
const chatMessageSchema = new mongoose.Schema({
  sender: String, // ui_id
  message: String,
  timestamp: { type: Date, default: Date.now },
});

// Now define the room schema
const roomSchema = new mongoose.Schema({
  roomName: String,
  roomId: { type: String, unique: true },
  ui_id: { type: Number, required: true }, // ui_id of the room creator
  roomLabel: { type: String, enum: ["Public", "Private"] },
  roomKey: {
    type: String,
    required: function () {
      return this.roomLabel === "Private";
    },
  },

  roomImage: String,
  roomThemeImage: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // room auto-deletion
  totalMembers: { type: Number, default: 1 },
  members: [{ type: String }], // use ui_id directly as string
  chat: [chatMessageSchema], // <-- now this works fine
  chatEnabled: {
    type: Boolean,
    default: true, // chat is allowed by default
  },
  roomBan: {
    isBanned: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["day", "month", "permanent", "custom"],
      default: null,
    },
    bannedAt: { type: Date },
    expiresAt: { type: Date, default: null },
    reason: { type: String },
  },
});

module.exports = mongoose.model("Room", roomSchema);
