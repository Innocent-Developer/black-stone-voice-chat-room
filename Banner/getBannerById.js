const Banner = require("../schema/banner-schema");

const getBannerbyid = async (req, res) =>{
    const { id } = req.params;
    try {
        // Fetch the banner by ID
        const banner = await Banner.findById(id);
        
        // Check if the banner exists
        if (!banner) {
            return res.status(404).json({ message: "Banner not found." });
        }
        
        res.status(200).json({
            message: "Banner retrieved successfully.",
            banner,
        });
    } catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
module.exports = getBannerbyid;