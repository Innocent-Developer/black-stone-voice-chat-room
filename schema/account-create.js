const mongoose = require("mongoose");
const schema = mongoose.Schema;
const accountCreateSchema = new schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userName: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (value) {
        // Must include at least one uppercase letter, one lowercase letter, one number, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
      },
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "other",
  },
  country: {
    type: String,
    default: "global ",
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
  },
  avatarUrl: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sXujgAPwegUA7onn6CJ5vwmitw-yR02eofn9_tgBumddyMZn0ADFxqNy4O0Zj6dTpP0&usqp=CAU", // Default avatar URL
  },
  role: {
    type: String,
    default: "user",
    enum: ["admin", "user", "merchant"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ui_id: {
    type: Number,
    unique: true,
    index: true,
  },
  gold: {
    type: Number,
    default: 0,
  },
  diamond: {
    type: Number,
    default: 0,
  },
  deviceToken: { type: String },

  followers: [{ type: Number }],
  following: [{ type: Number }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordOtp: { type: String },
  otpExpiration: { type: Number },
});
const AccountCreate = mongoose.model("AccountCreate", accountCreateSchema);
module.exports = AccountCreate;
