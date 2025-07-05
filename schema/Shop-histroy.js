const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
  itemCode: {
    type: Number,
    required: true
  },
  itemPrice: {
    type: Number,
    required: true
  },
  durication:{
    type:String ,
    required: true,
    enum: ["7day", "14day", "30day"]
    
  },
  ui_id: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

// Export the model
module.exports = mongoose.model("History", HistorySchema);
