const Post = require("../schema/post-schema");

const updatePost = async (req, res) => {
  try {
    const { postId, title, content, images, tags } = req.body;

    if (!postId) {
      return res.status(400).json({ message: "postId is required." });
    }

    // Find the post by post_id
    const postToUpdate = await Post.findOne({ post_id: postId });
    if (!postToUpdate) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Update the post fields
    if (title) postToUpdate.title = title;
    if (content) postToUpdate.content = content;
    if (images) postToUpdate.images = images;
    if (tags) postToUpdate.tags = tags;

    // Save the updated post
    await postToUpdate.save();

    res.status(200).json({
      message: "Post updated successfully.",
      post: postToUpdate,
    });
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};  

module.exports = updatePost;