const VvpiUsers = require("../schema/vvpiusers");

const UpdateVVIPS = async (req, res) => {
    try {
        const { id } = req.params;
        const { vipTital, vipDescription, vpiframe, bubbleChat, entarneentarneShow, price, duration, spicelGift, profileheadware, pic } = req.body;

        // Find the VVIPS item by ID
        const vvpiItem = await VvpiUsers.findById(id);
        if (!vvpiItem) {
            return res.status(404).json({ message: "VVIPS item not found" });
        }

        // Update fields if they are provided in the request body
        if (vipTital !== undefined) vvpiItem.vipTital = vipTital;
        if (vipDescription !== undefined) vvpiItem.vipDescription = vipDescription;
        if (vpiframe !== undefined) vvpiItem.vpiframe = vpiframe;
        if (bubbleChat !== undefined) vvpiItem.bubbleChat = bubbleChat;
        if (entarneentarneShow !== undefined) vvpiItem.entarneentarneShow = entarneentarneShow;
        if (price !== undefined) vvpiItem.price = price;
        if (duration !== undefined) vvpiItem.duration = duration;
        if (spicelGift !== undefined) vvpiItem.spicelGift = spicelGift;
        if (profileheadware !== undefined) vvpiItem.profileheadware = profileheadware;
        if (pic !== undefined) vvpiItem.pic = pic;

        // Save the updated item
        await vvpiItem.save();

        return res.status(200).json({
            message: "VVIPS item updated successfully",
            vvpiItem,
        });

    } catch (error) {
        console.error("Update VVIPS error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = UpdateVVIPS;