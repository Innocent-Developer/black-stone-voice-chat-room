const feedback = require("../schema/feedback-schema");

const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required." });
    }

    // Find the feedback entry first
    const existingFeedback = await feedback.findById(id);

    if (!existingFeedback) {
      return res.status(404).json({ error: "Feedback not found." });
    }

    // Prevent status change if already resolved
    if (existingFeedback.status === "resolved") {
      return res.status(400).json({ error: "Feedback is already resolved. Status cannot be changed." });
    }

    // Update the status
    existingFeedback.status = status;
    const updatedFeedback = await existingFeedback.save();

    res.status(200).json({
      message: "Feedback status updated successfully.",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = updateStatus;
