const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountCreateSchema = new Schema(
  {
    name: String,

    // ✅ Optional but must be unique **only when provided**
    userName: {
      type: String,
      index: { unique: true, sparse: true },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address."],
    },

    // ✅ If you want phone / number uniqueness only when present
    number: {
      type: String,
      index: { unique: true, sparse: true },
    },
    titaltags:[
      {
        tag: { type: String,},
        isDefault: { type: Boolean, default: false }
      },
      
    ],

    password: { type: String, required: true },
    avatarUrl: String,

    isVerified: { type: Boolean, default: false },

    ui_id: { type: Number, unique: true, required: true },

    gold: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },

    country: String,
    gender: String,

    isBlock: { type: Boolean, default: false },

    blockedRooms: [
      {
        roomId: String,
        type: { type: String, enum: ["permanent", "temporary"] },
        expiry: Date,
      },
    ],

    followers: [{ type: Number }],
    following: [{ type: Number }],

    resetPasswordOtp: String,
    otpExpiration: Number,
  },
  { timestamps: true }
);

/* ✅ Generate a unique 6‑digit ui_id */
accountCreateSchema.pre("save", async function (next) {
  if (this.ui_id) return next();

  let unique = false;
  while (!unique) {
    const candidate = Math.floor(100000 + Math.random() * 900000);
    const exists = await mongoose.models.AccountCreate.findOne({ ui_id: candidate });
    if (!exists) {
      this.ui_id = candidate;
      unique = true;
    }
  }
  next();
});

module.exports = mongoose.model("AccountCreate", accountCreateSchema);
