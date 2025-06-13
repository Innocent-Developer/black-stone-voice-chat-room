const Post = require("../schema/post-schema");
const User = require("../schema/account-create");

const likePostUser = async (req, res) => {
  try {
    const { postId, ui_id } = req.body;

    if (!postId || !ui_id) {
      return res
        .status(400)
        .json({ message: "postId and ui_id are required." });
    }

    // Check if user exists
    const userExists = await User.findOne({ ui_id });
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find post by post_id
    const postToLike = await Post.findOne({ post_id: postId });
    if (!postToLike) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if user already liked
    if (postToLike.likedBy.includes(ui_id)) {
      return res.status(400).json({ message: "User already liked this post." });
    }

    // Add like
    postToLike.likes += 1;
    postToLike.likedBy.push(ui_id);

    await postToLike.save();

    res.status(200).json({
      message: "Post liked successfully.",
      post: postToLike,
    });
  } catch (error) {
    console.error("Error liking post:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = likePostUser;
