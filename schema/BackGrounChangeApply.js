const mongoose = require("mongoose");
const { Schema } = mongoose;

const backgrounderchangerApply = new Schema({
    ui_id:{
        type:Number,
        required: true,
    },
    RoomId:{
        type: String,
        required: true,
    },
    backgroundImage: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const backGrounderChanger= mongoose.model("BackGrounderChangerApply", backgrounderchangerApply);
module.exports = backGrounderChanger;
// This schema is used to apply for changing the background of a room
// It includes fields for the user ID, room ID, background image, status of the application
// and timestamps for creation and updates. The status can be "pending", "approved", or "rejected".
// The schema also ensures that the user ID and room ID are required fields.
// The timestamps option automatically adds createdAt and updatedAt fields to the schema.
// The model is exported for use in other parts of the application.