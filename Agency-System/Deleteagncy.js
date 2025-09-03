const Agency = require("../schema/agencies-schema.js");
const AccountCreate = require("../schema/account-create.js");

const DeleteAgency = async (req, res) => {
  try {
    const { agencyId, ui_id } = req.body;

    if (!agencyId || !ui_id) {
      return res
        .status(400)
        .json({ message: "Agency ID and UI ID are required." });
    }

    const existingUser = await AccountCreate.findOne({ ui_id });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "Only registered users can delete an agency." });
    }
    // If user is not an agency creator, they cannot delete an agency
    if (existingUser.agencyCreaterType !== "Host") {
      return res
        .status(403)
        .json({ message: "Only agency creators can delete an agency." });
    }

    const agency = await Agency.findOne({ agencyId: Number(agencyId) });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    // Check if the user is the creator of the agency
    if (agency.createrId !== ui_id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this agency." });
    }

    // Remove all members from the agency
    for (const member of agency.joinUsers) {
      const memberUser = await AccountCreate.findOne({ ui_id: member.ui_id });
      if (memberUser) {
        memberUser.agencyCreaterType = "no"; // Reset to default value
        await memberUser.save();
      }
    }

    // Reset the creator's agencyCreaterType
    existingUser.agencyCreaterType = "no";
    await existingUser.save();

    // Delete the agency
    await Agency.deleteOne({ agencyId: Number(agencyId) });

    res.status(200).json({ message: "Agency deleted successfully." });
  } catch (error) {
    console.error("Error deleting agency:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = DeleteAgency;