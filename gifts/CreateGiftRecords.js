const LevelUpdate = require("../LevelsUpdates/userLevelUpdate");
const giftRecords = require("../schema/GiftsRecords");

const CreateGiftRecords = async (giftData) => {
  try {
    // Create a new gift record
    const newGiftRecord = new giftRecords(giftData);

    
    // Save the gift record to the database
    const savedGiftRecord = await newGiftRecord.save();
    console.log("🎁 Gift record saved:", savedGiftRecord)
    // update the sender's and receiver's XP and level
    // ✅ Call the LevelUpdate function here if needed
     await LevelUpdate(giftData.senderId, giftData.receiverId);
    
    return savedGiftRecord;
  } catch (error) {
    console.error("Error creating gift record:", error);
    throw error; // Rethrow the error for further handling
  }
}
module.exports = CreateGiftRecords;