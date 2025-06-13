const Post = require("../schema/post-schema");

const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Fetch all posts sorted by creation date
    res.status(200).json({
      message: "Posts fetched successfully.",
      totalPost:posts.length,
      ui_id: "all", // Since this is for all posts, we can set a generic ui_id
      posts: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = getAllPost;
// This function retrieves all posts from the database, sorts them by creation date in descending order, and returns them in the response.


