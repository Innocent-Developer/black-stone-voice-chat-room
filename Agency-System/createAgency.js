const Agency = require("../schema/agencies-schema.js");
const AccountCreate = require("../schema/account-create.js");

const createAgency = async (req, res) => {
  try {
    const { name, agencyName, agencyLogo, ui_id } = req.body;

    if (!name || !agencyName || !agencyLogo || !ui_id) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await AccountCreate.findOne({ ui_id:ui_id });
    if (!existingUser) {
      return res.status(404).json({ message: "Only registered users can create an agency." });
    }

    const existingAgency = await Agency.findOne({ agencyName });
    if (existingAgency) {
      return res.status(409).json({ message: "Agency already exists." });
    }

    const newAgency = new Agency({
      name,
      agencyName,
      agencyLogo,
      createrId: ui_id,
    });

    await newAgency.save();

    res.status(201).json({ message: "Agency created successfully.", agency: newAgency });
  } catch (error) {
    console.error("Error creating agency:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = createAgency;

