const Banner = require("../schema/banner-schema");

const checkBannerExpiry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize for date-only comparison

    // Set up a date range for the full day
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Update banners expiring today
    const result = await Banner.updateMany(
      {
        status: "active",
        expiry: {
          $gte: today,
          $lt: tomorrow,
        },
      },
      { $set: { status: "inactive" } }
    );

    res.status(200).json({
      message: "Banner expiry check completed.",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error checking banner expiry:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = checkBannerExpiry;
