const express = require("express");
const router = express.Router();

const signup = require("../account/signup");
const login = require("../account/login");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;