const express = require("express");
const router = express.Router();

const signup = require("../account/signup");
const login = require("../account/login");
const postFeedback = require("../Feedback/postfeedback");

router.post("/signup", signup);
router.post("/login", login);


// feedback routes
router.post("/client/feedback", postFeedback);

module.exports = router;