const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Banner ID is required"
            });
        }

        // Find the banner first to check if it exists
        const banner = await Banner.findById(id);
        
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        // Delete the banner
        await Banner.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting banner:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = { deleteBanner };
