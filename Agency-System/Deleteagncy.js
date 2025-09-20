const Agency = require("../schema/agencies-schema.js");
const AccountCreate = require("../schema/account-create.js");

const DeleteAgency = async (req, res) => {
  try {
    const { agencyId } = req.body;
    const agency = await Agency.findOne({ agencyId: Number(agencyId) });

    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
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
    if (agency.createrId) {
      const creatorUser = await AccountCreate.findOne({ ui_id: agency.createrId });
      if (creatorUser) {
        creatorUser.agencyCreaterType = "no";
        await creatorUser.save();
      }
    }

    // Delete the agency
    await Agency.deleteOne({ agencyId: Number(agencyId) });

    res.status(200).json({ message: "Agency deleted successfully." });
  } catch (error) {
    console.error("Error deleting agency:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = DeleteAgency;
