const Banner = require("../schema/banner-schema");

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the banner by ID and delete it
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    return res.status(200).json({
      message: "Banner deleted successfully",
      banner,
    });

  } catch (error) {
    console.error("Delete banner error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = deleteBanner;