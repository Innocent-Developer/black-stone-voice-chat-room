const mongoose = require("mongoose");
const schema = mongoose.Schema;

const agencies = new schema({
    name: {
        type: String,
        required: true,
    },
    agencyName: {
        type: String,
        required: true,
    },
    agencyId: {
        type: Number,
        unique: true,
        required: true,
    },
    agencyLogo: {
        type: String,
        required: true,
    },
    agencyCoin: {
        type: Number,
        default: 0,
    },
    agencyStatus: {
        type: String,
        enum: ["block", "unblock"],
        default: "unblock",
    },
    joinUsers: [
        {
            ui_id: {
                type: Number,
                required: true,
            },
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Helper to generate 7-digit random number
function generate7DigitId() {
    return Math.floor(1000000 + Math.random() * 9000000); // ensures a 7-digit number
}

// Pre-save hook to auto-generate unique agencyId
agencies.pre("save", async function (next) {
    if (this.isNew && !this.agencyId) {
        let isUnique = false;
        while (!isUnique) {
            const randomId = generate7DigitId();
            const existing = await mongoose.models.Agency.findOne({ agencyId: randomId });
            if (!existing) {
                this.agencyId = randomId;
                isUnique = true;
            }
        }
    }
    next();
});

const Agency = mongoose.model("Agency", agencies);
module.exports = Agency;
