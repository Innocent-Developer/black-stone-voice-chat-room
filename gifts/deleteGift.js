const Gift = require("../schema/Gifts");


const deleteGift = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Gift ID is required"
      });
    }

    const deletedGift = await Gift.findByIdAndDelete(id);

    if (!deletedGift) {
      return res.status(404).json({
        success: false,
        message: "Gift not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Gift deleted successfully",
      gift: deletedGift
    });

  } catch (error) {
    console.error("Error deleting gift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = deleteGift;