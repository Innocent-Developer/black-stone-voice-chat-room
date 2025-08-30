const express = require("express");
const router = express.Router();
const app = express();

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
const chatRouter = require("../chats/ChatRouter");
const getPost = require("../schema/post-schema");
const roomController = require("../RoomsApi/roomController");
const autoRoomExpiry = require("../RoomsApi/roomExpiry");
const getAllTransactionMerchants = require("../Merchant/getAlltransactionMerchants");

const createItem = require("../Shop/createItem");
const buyItem = require("../Shop/Buyitem");
const deleteItem = require("../Shop/deleteItem");
const updateItem = require("../Shop/Updateitem");
const getAllItems = require("../Shop/getAllitem");
const adminSendGift = require("../Shop/adminSendGift");
const merchantCoinAdd = require("../admin/merchantCoinAdd");
const { getAllAgency } = require("../Agency-System/Getallagency");
const CreateAgency = require("../Agency-System/createAgency");
const updateAgency = require("../Agency-System/Udateagency");
const joinAgency = require("../Agency-System/JoinAgency");
const applyBackgroundChange = require("../RoomsApi/backGroundChange");
const allRequest = require("../admin/GetAllResuestofBackground");
const adminapplyBackgroundChange = require("../admin/ApproveRoomBAckGroundChange");
const sendUserToUser = require("../withdraws/sendusertouser");
const { deleteBanner } = require("../Banner/deleteBaner");
const autoExpireBanners = require("../Banner/autoExpireBanners");
const { sendCointouserbym } = require("../Merchant/sendCointouserbym");
// account routes
router.post("/account/create/new", signup)
router.post("/verify-otp", require("../account/verifyotp"));
router.post("/login", login);
router.post("/user/account/delete/a/time", deleteUser);
router.post("/complete-profile", require("../account/accounCreaction"));

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
router.get("/admin/get/feedback/:id", getFeedbackById);

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
router.get("/get/merchant/user/o/bsvcr/user/find/:ui_id", getMerchantById);

// admin coin add merchants 
router.post("/admin/merchant/coin/add/fast", merchantCoinAdd);


// withdrawal
router.post("/client/withdrawal/request", requestWithdrawal);
router.post("/admin/approve/withdrawal", require("../admin/approve-withdrawl"));
router.get("/admin/get/all/withdraws", getAllWithdraws);
router.get("/get/user/withdraws/info/:ui_id", getwithdrawByUIID);

// send user to user
router.post("/api/v2/client/send/user/to/user", sendUserToUser);

// coin price
router.post("/admin/update/coin-price", require("../coins/coinPrice"));
router.get("/get/coin-price", getCoinPrice);

// gift send
router.post("/api/v2/client/gift/send", sendGift);
router.get("/api/v2/client/gift/get/all", require("../gifts/getAllGifts"));
router.post("/api/v2/admin/gift/create", require("../gifts/create-gift"));
router.delete("/api/v2/admin/gift/delete/:giftId", require("../gifts/deleteGift"));

// baner add
router.post("/admin/add/banner", addBanner);
router.get("/client/get/banner", getBanner);
router.get("/client/get/banner/i/d/full/n/:id", getBannerbyid);
// delete baner
router.delete("/admin/delete/baner/:id", deleteBanner)

setInterval(() => {
  autoExpireBanners();
}, 60 * 1000); // every 1 minute

// user post thing
router.post("/client/post/create", createPost);
router.get("/client/post/get", getAllPost);
router.post("/client/post/get/user", getPostUser);
router.post("/client/post/like", likePostUser);
router.post("/client/post/comment", commentPostUser);
// DELETE /post/delete
router.delete("/post/delete", async (req, res) => {
  const { postId } = req.body;

  try {
    const deleted = await getPost.findByIdAndDelete(postId);

    if (!deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: err.message });
  }
});
// PUT /post/update
router.put("/post/update", async (req, res) => {
  const { postId, title, content, tags, images } = req.body;

  try {
    const post = await getPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Update fields
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (images !== undefined) post.images = images;

    const updatedPost = await post.save();
    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating post", error: err.message });
  }
});

// follow/following
router.post("/client/follow", followUser);

// store device token
router.post("/client/store-device-token", storeDeviceToken);

// Enhanced chat system - supports both user-to-user and admin broadcast messaging
router.use("/chats", chatRouter);

// rooms controllers

router.post("/user/create/room", roomController.createRoom);
router.get("/user/get/rooms", roomController.getAllRooms);
router.get("/room/:roomId", roomController.getRoomById);
router.post('/room/join', roomController.joinRoom);
router.delete("/delete/room/:roomId", roomController.deleteRoom);
router.post("/block/room/user", roomController.blockUser);
router.put("/update/room/:roomId", roomController.updateRoom);
router.post('/room/:roomId/chat', roomController.sendMessage);
router.get('/room/:roomId/chat', roomController.getMessages);

// admin room controllers
router.get("/admin/rooms", roomController.getAllRooms);
router.get("/admin/room/:roomId", roomController.getRoomById);
router.post("/ban/room", roomController.banRoom);
router.post("/unban/room", roomController.unbanRoom);
router.post("/member/kickoff", roomController.kickOffMember);
router.put("/admin/room-chat-toggle/:roomId", roomController.adminChatBan);

// auto Expiry of rooms
setInterval(() => {
  autoRoomExpiry();
}, 60 * 1000); // every 1 minute


// Shops 
router.post("/shop/create", createItem)
router.post("/shop/buy", buyItem)
router.delete("/shop/delete/item", deleteItem)
router.post("/shop/update/item", updateItem)
router.get("/shop/items", getAllItems)
router.post("/admin/send/item", adminSendGift)


// Agency 
router.get("/api/v1/get/all/agency", getAllAgency)
router.post("/api/v1/agency/create", CreateAgency);
router.post("/api/v1/join/agency", joinAgency);
router.post("/api/v1/agency/update", updateAgency);

// Room Background Change
router.post("/api/v2/background/change/apply", applyBackgroundChange)
router.post("/api/v2/admin/change/status/background", adminapplyBackgroundChange);
router.get("/api/v2/admi/get/all/background/change/apply", allRequest);


// send coin from merchant  

router.post("/merchant/send/coin/to/user", sendCointouserbym);

// upload file r2 
const { uploadMiddleware, handleMulterError, uploadFileR2, deleteFileR2 } = require("../r2Storages/uploadFile");

// Upload endpoint
router.post("/upload/file", uploadMiddleware('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await uploadFileR2(req.file);
        res.status(200).json(result);
    } catch (error) {
        handleMulterError(error, res);
    }
});

// Delete endpoint
router.delete("/delete/file", async (req, res) => {
    const { fileName } = req.body;

    try {
        const result = await deleteFileR2(fileName);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting file', details: error.message });
    }
});



module.exports = router;