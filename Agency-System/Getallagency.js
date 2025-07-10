const Agency = require("../schema/agencies-schema.js");

const getAllAgency = async (req, res) => {
  try {
    const agencies = await Agency.find(); // fetch all documents
    res.status(200).json({ success: true, data: agencies });
  } catch (error) {
    console.error("Error fetching agencies:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getAllAgency };
