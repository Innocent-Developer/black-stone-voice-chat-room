const Post = require("../schema/post-schema");
const User = require("../schema/account-create");

const commentPostUser = async (req, res) => {
  try {
    const { postId, ui_id, text } = req.body;

    if (!postId || !ui_id || !text) {
      return res
        .status(400)
        .json({ message: "postId, ui_id, and text are required." });
    }

    // Validate user
    const userExists = await User.findOne({ ui_id });
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the post
    const postToComment = await Post.findOne({ post_id: postId });
    if (!postToComment) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Add comment
    postToComment.comments.push({
      ui_id,
      text,
    });

    await postToComment.save();

    res.status(200).json({
      message: "Comment added successfully.",
      comments: postToComment.comments,
    });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = commentPostUser;
