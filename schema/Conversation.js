const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema({
  members: [
    {
      type:number,
      required: true,
      ref: "AccountCreate", // Assuming you have an AccountCreate model
      
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
