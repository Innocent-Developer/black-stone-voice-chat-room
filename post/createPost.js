const Post = require("../schema/post-schema");
const User = require("../schema/account-create");

const createPost = async (req, res) => {
  try {
    const { title, content, images, ui_id, tags } = req.body;

    if (!title || !content || !ui_id) {
      return res
        .status(400)
        .json({ message: "Title, content, and ui_id are required." });
    }

    // Check if user exists
    const authorExists = await User.findOne({ ui_id });
    if (!authorExists) {
      return res.status(404).json({ message: "Author not found." });
    }

    // if (images && !Array.isArray(images)) {
    //   return res.status(400).json({ message: "Images must be an array." });
    // }

    // 🔢 Get the latest post_id (if any), or default to 2000
    const lastPost = await Post.findOne().sort({ post_id: -1 }).lean();
    const nextPostId = lastPost?.post_id ? lastPost.post_id + 1 : 2001;

    // Create post with incremented post_id
    const newPost = new Post({
      post_id: nextPostId,
      title,
      content,
      images: images || [],
      ui_id,
      tags: tags || [],
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully.",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = createPost;
