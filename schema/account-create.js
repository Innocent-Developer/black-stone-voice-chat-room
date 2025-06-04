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
  phoneNumber: {
    type: String,
    unique: true,
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
    enum: ["admin", "user"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const AccountCreate = mongoose.model("AccountCreate", accountCreateSchema);
module.exports = AccountCreate;
