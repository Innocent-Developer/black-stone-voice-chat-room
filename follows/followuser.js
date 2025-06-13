const User = require("../schema/account-create");

const followUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ message: "Both followerId and followingId are required." });
    }

    if (followerId === followingId) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    const follower = await User.findOne({ ui_id: followerId });
    const following = await User.findOne({ ui_id: followingId });

    if (!follower || !following) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = follower.following.includes(followingId);

    if (isFollowing) {
      // Unfollow
      follower.following = follower.following.filter(id => id !== followingId);
      following.followers = following.followers.filter(id => id !== followerId);
    } else {
      // Follow
      follower.following.push(followingId);
      following.followers.push(followerId);
    }

    await follower.save();
    await following.save();

    res.status(200).json({
      message: isFollowing ? "Unfollowed successfully." : "Followed successfully.",
      follower: follower.following,
      following: following.followers,
    });
  } catch (error) {
    console.error("Error following user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = followUser;
