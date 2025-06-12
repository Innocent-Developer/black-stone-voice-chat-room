const Banner = require("../schema/banner-schema");

const autoExpireBanners = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for date-only comparison

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

    console.log(
      `Banner expiry check completed. Updated count: ${result.modifiedCount}`
    );
  } catch (error) {
    console.error("Error checking banner expiry:", error);
  }
};
module.exports = autoExpireBanners;
