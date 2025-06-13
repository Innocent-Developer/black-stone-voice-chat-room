const post = require("../schema/post-schema");

const getPostUser = async (req, res) => {
  try {
    const { ui_id } = req.body;

    if (!ui_id) {
      return res.status(400).json({ message: "ui_id is required." });
    }

    // Fetch posts by user
    const posts = await post.find({ ui_id: ui_id }).sort({ createdAt: -1 });

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user." });
    }
    if (ui_id === "undefined") {
      return res.status(400).json({ message: "Invalid ui_id." });
    }
    res.status(200).json({
      message: "Posts fetched successfully.",
      totalPost: posts.length,
      ui_id: ui_id,
      posts: posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = getPostUser;
