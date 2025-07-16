const feedback = require("../schema/feedback-schema");

const postFeedback = async (req, res) => {
  try {
    const { name, uid, email, problemType, description, image } = req.body;

    // Validate required fields
    if (!name || !uid || !email ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create a new feedback entry
    const newFeedback = new feedback({
      name,
      uid,
      email,
      problemType,
      description,
      image,
    });

    // Save the feedback to the database
    await newFeedback.save();

    // Respond with success message
    res.status(201).json({
      message: "Feedback submitted successfully.",
      
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = postFeedback;
