const express = require('express');
const router = express.Router();
const Agency = require("../schema/agencies-schema.js");// Assuming Mongoose model
const AgencyRequest = require('../schema/agency-request.js'); // Assuming Mongoose model
const User =  require("../schema/account-create.js"); 

// GET /api/v1/agency/creator/:uiId - Get agency created by user
router.get('/agency/creator/:uiId', async (req, res) => {
    try {
        const { uiId } = req.params;
        const agency = await Agency.findOne({ creator: uiId });
        if (!agency) {
            return res.status(404).json({ message: 'Agency not found' });
        }
        res.json(agency);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/v1/agency/member/:uiId - Get agency user joined
router.get('/agency/member/:uiId', async (req, res) => {
    try {
        const { uiId } = req.params;
        const agency = await Agency.findOne({ members: uiId });
        if (!agency) {
            return res.status(404).json({ message: 'Agency not found' });
        }
        res.json(agency);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// request create agency
router.post('/agency/request/create', async (req, res) => {
    try {
        const { agencyId } = req.body;
        const agency = await Agency.findById(agencyId);
        if (!agency) {
            return res.status(404).json({ message: 'Agency not found' });
        }
        const request = await AgencyRequest.create({
            agency: agency.agencyId,
            user: agency.createrId,
            status: 'pending'
        });
        agency.requests.push(request.agencyId);
        await agency.save();
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/v1/agency/:agencyId/requests - Get join requests
router.get('/agency/:agencyId/requests', async (req, res) => {
    try {
        const { agencyId } = req.params;
        const requests = await AgencyRequest.find({ agency: agencyId });
        if (!requests) {
            return res.status(404).json({ message: 'Requests not found' });
        }
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/v1/agency/request/accept - Accept join request
router.post('/agency/request/accept', async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await AgencyRequest.findById(requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }
        request.status = 'accepted';
        await request.save();

        // Add user to agency members
        await Agency.findByIdAndUpdate(request.agency, { $addToSet: { joinUsers: request.user._id } });

        res.json({ message: 'Request accepted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/v1/agency/request/reject - Reject join request
router.post('/agency/request/reject', async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await AgencyRequest.findById(requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Request not found or already processed' });
        }
        request.status = 'rejected';
        await request.save();
        await Agency.findByIdAndUpdate(request.agency, { $pull: { joinUsers: request.user._id } });
        res.json({ message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
