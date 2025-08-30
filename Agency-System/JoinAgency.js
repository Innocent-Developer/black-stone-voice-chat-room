const Agency = require("../schema/agencies-schema.js");
const AccountCreate = require("../schema/account-create.js");

const joinAgency = async (req, res) => {
  try {
    const { agencyId, ui_id } = req.body;

    if (!agencyId || !ui_id) {
      return res
        .status(400)
        .json({ message: "Agency ID and UI ID are required." });
    }

    const existingUser = await AccountCreate.findOne({uid_id: ui_id });
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "Only registered users can join an agency." });
    }

    const agency = await Agency.findOne({ agencyId: Number(agencyId) });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    // Check if user is already in the joinUsers list
    const alreadyMember = agency.joinUsers.some(
      (user) => user.ui_id === Number(ui_id)
    );
    if (alreadyMember) {
      return res
        .status(409)
        .json({ message: "User is already a member of this agency." });
    }

    // Add the user to joinUsers
    agency.joinUsers.push({ ui_id: Number(ui_id) });
    await agency.save();

    res
      .status(200)
      .json({ message: "Successfully joined the agency.", agency });
  } catch (error) {
    console.error("Error joining agency:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = joinAgency;