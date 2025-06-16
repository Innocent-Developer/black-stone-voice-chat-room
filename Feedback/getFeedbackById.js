const feedback = require("../schema/feedback-schema");

const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedbackData = await feedback.findById(id);
    if (!feedbackData) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json({
      message: "Feedback retrieved successfully.",
      feedback: feedbackData,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = getFeedbackById;
