const Gift = require("../schema/Gifts");

const generate7DigitCode = () => {
  return Math.floor(1000000 + Math.random() * 9000000); // 1000000 to 9999999
};

const createGift = async (req, res) => {
  try {
    const { amount, giftName, giftImage, giftFile, giftCategory } = req.body;

    // Validate required fields
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required"
      });
    }

    // Generate a unique 7-digit giftCode
    let giftCode;
    let isDuplicate = true;
    let attempts = 0;

    while (isDuplicate && attempts < 5) {
      giftCode = generate7DigitCode();
      const existing = await Gift.findOne({ giftCode });
      isDuplicate = !!existing;
      attempts++;
    }

    if (isDuplicate) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate a unique gift code after multiple attempts"
      });
    }

    // Create new gift
    const newGift = new Gift({
      giftCode,
      amount,
      giftName: giftName || "",
      giftImage: giftImage || "",
      giftFile: giftFile || "",
      giftCategory: giftCategory || "normal"
    });

    await newGift.save();

    res.status(201).json({
      success: true,
      message: "Gift created successfully",
      gift: newGift
    });

  } catch (error) {
    console.error("Error creating gift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = createGift;
