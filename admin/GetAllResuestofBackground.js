const backgrounderChanger = require('../schema/BackGrounChangeApply');

const allRequest = async (req, res) => {
    try {
        const requests = await backgrounderChanger.find().sort({ createdAt: -1 });
        if (!requests || requests.length === 0) {
            return res.status(404).json({ message: "No background change requests found" });
        }
        return res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching background change requests:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}
module.exports = allRequest;