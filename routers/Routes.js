const express = require("express");
const router = express.Router();

const signup = require("../account/signup");
const login = require("../account/login");
const postFeedback = require("../Feedback/postfeedback");
const getFeedback = require("../Feedback/getfeedback");
const updateStatus = require("../Feedback/updateFeedback");
const passwordResetOtp = require("../account/resetPasswordlink");

// account routes
router.post("/signup", signup);
router.post("/login", login);

// get user
router.get("/admin/all/users", require("../account/getalluser"));
// passwordReset 
router.post("/client/reset-password",passwordResetOtp );
router.post("/client/reset-password/new-password", require("../account/newPassword"));

// feedback routes
router.post("/client/feedback", postFeedback);
router.get("/admin/all/feedback",getFeedback);
router.post("/admin/update/feedback", updateStatus);

module.exports = router;