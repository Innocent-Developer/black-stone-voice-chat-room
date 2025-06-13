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
const coinbuymerchant = require("../coins/buyCoinMerchant");
const approvebuycoin = require("../Merchant/merchant-approve-coin-buy");
const approveCoinBuyLocalUsers = require("../admin/approve-coin-buy-localusers");
const requestWithdrawal = require("../withdraws/requestWithdrawel");
const sendGift = require("../gifts/send-gift");
const addBanner = require("../Banner/addBanner");
const autoExpireBanners = require("../Banner/autoExpireBanners");
const createPost = require("../post/createPost");
const getAllPost = require("../post/getAllpost");
const getPostUser = require("../post/getPostuser");
const likePostUser = require("../post/likePostUser");
const commentPostUser = require("../post/commentPostUser");
const followUser = require("../follows/followuser");
const getUserUIID = require("../account/getuserbyuiid");

// account routes
router.post("/signup", signup);
router.post("/login", login);

// get user
// router.get("/admin/all/users", require("../account/getAllUser"));
router.post("/update-user", updateUser);
router.get("/client/get/user/:ui_id", getUserUIID);
// passwordReset
router.post("/client/reset-password", passwordResetOtp);
router.post(
  "/client/reset-password/new-password",
  require("../account/newPassword")
);

// feedback routes
router.post("/client/feedback", postFeedback);
router.get("/admin/all/feedback", getFeedback);
router.post("/admin/update/feedback", updateStatus);

// buy coins
router.post("/client/buy-coins", buyCoins);
router.post("/coin-buy/merchant/local", coinbuymerchant);
router.post("/merchant-approve/coin/user", approvebuycoin);
router.post("/admin/approve/coin/buy/users", approveCoinBuyLocalUsers);

//merchant
router.post("/apply-merchant", applyMerchant);
router.post("/admin/approve/merchant", approveMerchant);
router.post("/merchant/buy-coin", require("../Merchant/merchantCoinBuy"));
router.post("/admin/approve/coin", require("../Merchant/adminapprove-coin"));

// withdrawal
router.post("/client/withdrawal/request", requestWithdrawal);
router.post("/admin/approve/withdrawal", require("../admin/approve-withdrawl"));

// coin price
router.post("/admin/update/coin-price", require("../coins/coinPrice"));

// gift send
router.post("/client/gift/send", sendGift);

// baner add
router.post("/admin/add/banner", addBanner);

setInterval(() => {
  autoExpireBanners();
}, 60 * 1000); // every 1 minute

// user post thing
router.post("/client/post/create", createPost);
router.get("/client/post/get", getAllPost);
router.post("/client/post/get/user", getPostUser);
router.post("/client/post/like", likePostUser);
router.post("/client/post/comment", commentPostUser);
router.get("/client/post/get/all", getAllPost);

// follow/following 
router.post("/client/follow",followUser);

module.exports = router;
