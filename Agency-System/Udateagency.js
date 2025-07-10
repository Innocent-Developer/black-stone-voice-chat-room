const Agency = require("../schema/agencies-schema.js");

const updateAgency = async (req, res) => {
  try {
    const { agencyId, name, agencyName, agencyLogo } = req.body;

    if (!agencyId) {
      return res.status(400).json({ message: "Agency ID is required." });
    }

    const agency = await Agency.findOne({ agencyId: Number(agencyId) });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    // Update only provided fields
    if (name) agency.name = name;
    if (agencyName) agency.agencyName = agencyName;
    if (agencyLogo) agency.agencyLogo = agencyLogo;

    await agency.save();

    res.status(200).json({ message: "Agency updated successfully.", agency });
  } catch (error) {
    console.error("Error updating agency:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = updateAgency;
