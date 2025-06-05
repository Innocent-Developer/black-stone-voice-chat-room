const feedback = require("../schema/feedback-schema");

const getFeedback = async (req, res) => {
  try {
    const allFeedback = await feedback.find();
    res.status(200).json(allFeedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to retrieve feedback", error });
  }
};

module.exports = getFeedback;
