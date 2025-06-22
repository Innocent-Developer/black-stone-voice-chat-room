const Banner = require("../schema/banner-schema");
const cloudinary = require("../utils/cloudinary"); // Cloudinary config file

const addBanner = async (req, res) => {
  const { image, url, status, expiry } = req.body;

  if (!image || !url || !expiry) {
    return res.status(400).json({ message: "Please fill all the fields." });
  }

  try {
    // Upload base64 image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "banners",
    });

    // Save only the Cloudinary URL in MongoDB
    const newBanner = new Banner({
      image: uploadResult.secure_url,
      url,
      status: status || "active",
      expiry,
    });

    await newBanner.save();

    res.status(201).json({ message: "Banner added successfully.", banner: newBanner });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = addBanner;
