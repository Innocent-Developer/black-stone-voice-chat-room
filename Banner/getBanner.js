const Banner = require("../schema/banner-schema");

const getBanner = async (req, res) => {
  try {
    const allBanner = await Banner.find();
    const totalActiveBanner = allBanner.filter(
      (banner) => banner.status === "active"
    );
    const inactiveBanner = allBanner.filter(
      (banner) => banner.status === "inactive"
    );
    res.status(200).json({
      TotalBanner: allBanner.length,
      TotalActiveBanner: totalActiveBanner.length,
      TotalInactiveBanner: inactiveBanner.length,
      allBanner,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch banners", error: error.message });
  }
};

module.exports = { getBanner };
