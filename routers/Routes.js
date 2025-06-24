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
const createPost = require("../post/createPost");
const getAllPost = require("../post/getAllpost");
const getPostUser = require("../post/getPostuser");
const likePostUser = require("../post/likePostUser");
const commentPostUser = require("../post/commentPostUser");
const followUser = require("../follows/followuser");
const getUserUIID = require("../account/getuserbyuiid");
const getAlluser = require("../account/getalluser");
const getCoinPrice = require("../coins/getCoinprice");
const { getBanner } = require("../Banner/getBanner");
const getAllWithdraws = require("../withdraws/getAllwithdraws");
const getwithdrawByUIID = require("../withdraws/getWithdrawsByUIID");
const getAllTransaction = require("../coins/getAllTransaction");
const deleteUser = require("../account/deleteUser");
const getTransactionByUIID = require("../coins/getTransactionByuiid");
const storeDeviceToken = require("../controllers/saveDeviceToken");
const approveCoinsell = require("../Merchant/approve-sendcoinUser");
const getAllMerchants = require("../Merchant/getAllMerchants");
const getMerchantById = require("../Merchant/getMerchantById");
const getBannerbyid = require("../Banner/getBannerById");
const getFeedbackById = require("../Feedback/getFeedbackById");
const chatRouter = require("../chats/ChatRouter")

// account routes
router.post("/account-creation/:id", signup);
router.post("/login", login);
router.post("/user/account/delete/a/time", deleteUser);

// get user
router.get("/a/admin/bsvcr/get/all/users", getAlluser);

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
router.get("/admin/get/feedback/:id",getFeedbackById);

// buy coins
router.post("/client/buy-coins", buyCoins);
router.post("/coin-buy/merchant/local", coinbuymerchant);
router.post("/merchant-approve/coin/user", approvebuycoin);
router.post("/admin/approve/coin/buy/users", approveCoinBuyLocalUsers);
router.get("/get/all/transaction/admin/a/", getAllTransaction);
router.get("/client/admin/get/transaction/a/i/d/:ui_id", getTransactionByUIID);

//merchant
router.post("/apply-merchant", applyMerchant);
router.post("/admin/approve/merchant", approveMerchant);
router.post("/merchant/buy-coin", require("../Merchant/merchantCoinBuy"));
router.post("/admin/approve/coin", require("../Merchant/adminapprove-coin"));
router.post("/merchant/approve/sell/coin/a/live", approveCoinsell);
router.get("/get/all/a/vvpi/merchants", getAllMerchants);
router.get("/get/merchant/user/o/bsvcr/user/find/:ui_id",getMerchantById)

// withdrawal
router.post("/client/withdrawal/request", requestWithdrawal);
router.post("/admin/approve/withdrawal", require("../admin/approve-withdrawl"));
router.get("/admin/get/all/withdraws", getAllWithdraws);
router.get("/get/user/withdraws/info/:ui_id", getwithdrawByUIID);

// coin price
router.post("/admin/update/coin-price", require("../coins/coinPrice"));
router.get("/get/coin-price", getCoinPrice);

// gift send
router.post("/client/gift/send", sendGift);

// baner add
router.post("/admin/add/banner", addBanner);
router.get("/client/get/banner", getBanner);
router.get("/client/get/banner/i/d/full/n/:id",getBannerbyid)

setInterval(() => {
  autoExpireBanners();
}, 60 * 1000); // every 1 minute

// user post thing
router.post("/client/post/create", createPost);
router.get("/client/post/get", getAllPost);
router.post("/client/post/get/user", getPostUser);
router.post("/client/post/like", likePostUser);
router.post("/client/post/comment", commentPostUser);

// follow/following
router.post("/client/follow", followUser);

// store device token
router.post("/client/store-device-token", storeDeviceToken);

// chats by admin 
router.use("/chats", chatRouter);


// user chat routes
router.use("/chats/users", chatRouter);


module.exports = router;
