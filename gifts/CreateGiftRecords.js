const giftRecords = require("../schema/GiftsRecords");

const CreateGiftRecords = async (giftData) => {
  try {
    // Create a new gift record
    const newGiftRecord = new giftRecords(giftData);
    
    // Save the gift record to the database
    const savedGiftRecord = await newGiftRecord.save();
    
    return savedGiftRecord;
  } catch (error) {
    console.error("Error creating gift record:", error);
    throw error; // Rethrow the error for further handling
  }
}
module.exports = CreateGiftRecords;