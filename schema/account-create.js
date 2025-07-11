const mongoose = require("mongoose");
const schema = mongoose.Schema;

const accountCreateSchema = new schema(
  {
    name: {
      type: String,
    },
    userName: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    ui_id: {
      type: Number,
      unique: true,
      required: true,
    },

    gold: {
      type: Number,
      default: 0,
    },
    diamond: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
    },
    gender: {
      type: String,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    blockedRooms: [
      {
        roomId: String,
        type: { type: String, enum: ["permanent", "temporary"] },
        expiry: Date, // for temporary blocks
      },
    ],
    followers: [
      {
        type: Number,
      },
    ],
    following: [
      {
        type: Number,
      },
    ],
    resetPasswordOtp: {
      type: String,
    },
    otpExpiration: {
      type: Number,
    },
  },
  { timestamps: true }
);

// ✅ Generate unique 6-digit ui_id
accountCreateSchema.pre("save", async function (next) {
  const user = this;

  if (!user.ui_id) {
    let isUnique = false;

    while (!isUnique) {
      const randomId = Math.floor(100000 + Math.random() * 900000); // 6-digit number
      const existingUser = await mongoose.models.AccountCreate.findOne({
        ui_id: randomId,
      });

      if (!existingUser) {
        user.ui_id = randomId;
        isUnique = true;
      }
    }
  }

  next();
});

const AccountCreate = mongoose.model("AccountCreate", accountCreateSchema);
module.exports = AccountCreate;
