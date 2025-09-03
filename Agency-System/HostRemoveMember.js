// only host and admin can remove member from agency 
const Agency = require("../schema/agencies-schema.js");
const AccountCreate = require("../schema/account-create.js");

const hostRemoveMember = async (req, res) => {
  try {
    const { agencyId, ui_id, removerUiId } = req.body;

    if (!agencyId || !ui_id || !removerUiId) {
      return res
        .status(400)
        .json({ message: "Agency ID, UI ID, and Remover UI ID are required." });
    }

    // Check if the remover has permission (admin or host)
    const agency = await Agency.findOne({ agencyId: Number(agencyId) });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    // Find the remover in the agency
    const remover = agency.joinUsers.find(
      (user) => user.ui_id === Number(removerUiId)
    );

    if (!remover) {
      return res
        .status(403)
        .json({ message: "You are not a member of this agency." });
    }

    // Check if remover has admin or host privileges
    if (remover.role !== "Admin" && remover.role !== "Host") {
      return res
        .status(403)
        .json({ message: "Only admin and host can remove members." });
    }

    const existingUser = await AccountCreate.findOne({ ui_id });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "Only registered users can be removed from an agency." });
    }

    // If user is an agency host, they cannot be removed
    if (existingUser.agencyCreaterType === "Host") {
      return res
        .status(403)
        .json({ message: "Agency hosts cannot be removed from the agency." });
    }

    // Check if user is a member of the specified agency
    const memberIndex = agency.joinUsers.findIndex(
      (user) => user.ui_id === Number(ui_id)
    );

    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ message: "User is not a member of this agency." });
    }

    // Remove the user from joinUsers
    agency.joinUsers.splice(memberIndex, 1);
    await agency.save();

    // Update user agencyCreaterType to no
    existingUser.agencyCreaterType = "no";
    await existingUser.save();

    return res
      .status(200)
      .json({ message: "User removed from the agency successfully." });
  } catch (error) {
    console.error("Error removing member from agency:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = hostRemoveMember;