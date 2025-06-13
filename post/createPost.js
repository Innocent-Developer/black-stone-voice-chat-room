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

    // Validate user
    const authorExists = await User.findOne({ ui_id: ui_id });
    if (!authorExists) {
      return res.status(404).json({ message: "Author not found." });
    }

    // Validate images (optional)
    if (images && !Array.isArray(images)) {
      return res.status(400).json({ message: "Images must be an array." });
    }

    // Create post
    const newPost = new Post({
      title,
      content,
      images: images || [], // assign multiple images here
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
