const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historyVIPSschema = new Schema({
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
    },
    pic:{
        type: String,
    },
    buyDate:{
        type: Date,
        default: Date.now
    },
    expireDate:{
        type: Date,
    }
});
const HistoryVIPS = mongoose.model("HistoryVIPS", historyVIPSschema);
module.exports = HistoryVIPS;