const Agency = require("../schema/agencies-schema.js");
const AccountCreate = require("../schema/account-create.js");

//get agency reord by agencyId and also user record how create agency and how user join

const getAgencyRecord = async (req, res) => {
  try {
    const { agencyId } = req.body;

    if (!agencyId) {
      return res
        .status(400)
        .json({ message: "Agency ID is required." });
    }

    const agency = await Agency.findOne({ agencyId: Number(agencyId) });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    // Find the user who created the agency
    const creator = await AccountCreate.findOne({ ui_id: agency.createrId });

    // Find users who joined the agency
    const joinedUsers = await AccountCreate.find({
      ui_id: { $in: agency.joinUsers.map(user => user.ui_id) }
    });

    return res.status(200).json({
      message: "Agency record retrieved successfully",
      agency,
      creator,
      joinedUsers
    });
  } catch (error) {
    console.error("Get agency record error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = getAgencyRecord;