const mongoose = require("mongoose");
const schema = mongoose.Schema;

const feedbackSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    requird: true,
  },
  email: {
    type: String,
    required: true,
  },
  problemType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  status:{
    type: String,
    default: "pending",
    enum: ["pending", "in-progress", "resolved", "closed"],
  }
});
const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
