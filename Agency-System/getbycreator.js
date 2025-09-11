const express = require('express');
const router = express.Router();
const Agency = require("../schema/agencies-schema.js");
const AgencyRequest = require('../schema/agency-request.js');
const User = require("../schema/account-create.js");

// GET /api/v1/agency/creator/:uiId - Get agency created by user
router.get('/creator/:uiId', async (req, res) => {
    try {
        const { uiId } = req.params;
        const agencies = await Agency.find({ creator: uiId });
        if (!agencies || agencies.length === 0) {
            return res.status(404).json({ message: 'No agencies found' });
        }
        res.json(agencies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/v1/agency/member/:uiId - Get agency user joined
router.get('/member/:uiId', async (req, res) => {
    try {
        const { uiId } = req.params;
        const agencies = await Agency.find({ members: uiId });
        if (!agencies || agencies.length === 0) {
            return res.status(404).json({ message: 'No agencies found' });
        }
        res.json(agencies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/v1/agency/request/create - Create join request 
router.post('/request/create', async (req, res) => {
    try {
        const { agencyId, userId } = req.body;
        
        // Validate agency exists
        const agency = await Agency.findById(agencyId);
        if (!agency) {
            return res.status(404).json({ message: 'Agency not found' });
        }

        // Check if request already exists
        const existingRequest = await AgencyRequest.findOne({
            agency: agencyId,
            user: userId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        // Create new request
        const request = await AgencyRequest.create({
            agency: agencyId,
            user: userId,
            status: 'pending'
        });

        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/v1/agency/:agencyId/requests - Get join requests
router.get('/:agencyId/requests', async (req, res) => {
    try {
        const { agencyId } = req.params;
        const requests = await AgencyRequest.find({ agency: agencyId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
            
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/v1/agency/request/accept - Accept join request  
router.post('/request/accept', async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await AgencyRequest.findById(requestId)
            .populate('agency')
            .populate('user');

        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Invalid request' });
        }

        request.status = 'accepted';
        await request.save();

        // Add user to agency members
        await Agency.findByIdAndUpdate(
            request.agency._id,
            { $addToSet: { members: request.user._id } }
        );

        res.json({ message: 'Request accepted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message }); 
    }
});

// POST /api/v1/agency/request/reject - Reject join request
router.post('/request/reject', async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await AgencyRequest.findById(requestId);

        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Invalid request' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ message: 'Request rejected successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
