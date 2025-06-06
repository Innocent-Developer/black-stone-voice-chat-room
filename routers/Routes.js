const express = require("express");
const router = express.Router();

const signup = require("../account/signup");
const login = require("../account/login");
const postFeedback = require("../Feedback/postfeedback");
const getFeedback = require("../Feedback/getfeedback");
const updateStatus = require("../Feedback/updateFeedback");
const passwordResetOtp = require("../account/resetPasswordlink");
const updateUser = require("../account/updateuser");
const buyCoins = require("../coins/buycoin");
const applyMerchant = require("../Merchant/applyMerchant");
const approveMerchant = require("../Merchant/approve-merchant");

// account routes
router.post("/signup", signup);
router.post("/login", login);

// get user
router.get("/admin/all/users", require("../account/getalluser"));
router.post("/update-user",updateUser)
// passwordReset 
router.post("/client/reset-password",passwordResetOtp );
router.post("/client/reset-password/new-password", require("../account/newPassword"));

// feedback routes
router.post("/client/feedback", postFeedback);
router.get("/admin/all/feedback",getFeedback);
router.post("/admin/update/feedback", updateStatus);

// buy coins
router.post("/client/buy-coins", buyCoins);



//merchant
router.post("/apply-merchant",applyMerchant)
router.post("/admin/approve/merchant",approveMerchant)
router.post("/merchant/buy-coin", require("../Merchant/merchantCoinBuy"));
router.post("/admin/approve/coin", require("../Merchant/adminapprove-coin"));

module.exports = router;