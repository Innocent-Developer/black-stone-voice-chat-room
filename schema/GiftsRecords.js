const mongoose = require("mongoose");
const { Schema } = mongoose;  // ✅ FIXED LINE

const Gifts = new Schema({
    giftCode: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    giftName: {
        type: String
    },
    giftImage: {
        type: String
    },
    giftFile: {
        type: String
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