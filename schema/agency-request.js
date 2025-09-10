const mongoose = require("mongoose");
const schema = mongoose.Schema;

const agencyRequestSchema = new schema({
    agency: {
        type:Number
    },
    user: {
       type:String
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
});

module.exports = mongoose.model("AgencyRequest", agencyRequestSchema);
