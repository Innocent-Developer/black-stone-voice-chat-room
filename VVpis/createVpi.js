const VvpiUsers = require("../schema/vvpiusers");

const createVpi = async (req, res) => {
    const { ui_id, vipTital, vipDescription, vpiframe, bubbleChat, entarneentarneShow, price, days, spicelGift, profileheadware ,pic} = req.body;

    // if (!ui_id ) {
    //     return res.status(400).json({ message: "All fields are required" });
    // }

    try {
        const newVpi = new VvpiUsers({
            ui_id,
            vipTital,
            vipDescription,
            vpiframe,
            pic,
            bubbleChat,
            entarneentarneShow,
            price,
            days,
            spicelGift,
            profileheadware
        });

        const savedVpi = await newVpi.save();
        res.status(201).json(savedVpi);
    } catch (error) {
        console.error("Error creating VPI:", error);
        res.status(500).json({ message: "Server error while creating VPI" });
    }
};

module.exports = createVpi; 