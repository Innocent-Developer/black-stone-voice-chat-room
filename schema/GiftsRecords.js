const mongoose = require("mongoose");
const { Schema } = mongoose;  // ✅ FIXED LINE

const Gifts = new Schema({
    giftCode: {
        type: Number,
    },
    amount: {
        type: Number,
    },
   
    
    senderId: {
        type: Number,
    },
    receiverId: {
        type: Number,
    },

})

const giftRecords = mongoose.model("gifts", Gifts);
module.exports = giftRecords;