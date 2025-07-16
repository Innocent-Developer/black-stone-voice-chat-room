const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vvpiUsersSchema = new Schema({
    ui_id:{
        type:Number,
        required: true,
    },
    vipTital:{
        type: String,
    },
    vipDescription: {
        type: String,
    },
    vpiframe:{
        type: String,
    },
    bubbleChat:{
        type: String,
    },
    entarneentarneShow:{
        type: String,
    },
    price:{
        type: Number,
    },
    days:{
        type: Number,
    },
    spicelGift:{
       type: String, 
    },
    profileheadware:{
        type: String,
    }
});
const VvpiUsers = mongoose.model("VvpiUsers", vvpiUsersSchema);
module.exports = VvpiUsers;