const giftRecords = require("../schema/GiftsRecords");
const user = require("../schema/account-create");

// XP requirements per level (Lv1 to Lv100)
const levelXpMap = [
  3000, 3000, 3000, 3000, 3000,            // Lv1 - Lv5 (5 x 3k = 15k)
  6000, 6000, 6000, 6000, 6000, 6000,      // Lv6 - Lv11 (6 x 6k = 36k)
  390000, 390000,                         // Lv12 - Lv13 (2 x 390k)
  1000000, 1000000, 1000000,              // Lv14 - Lv16 (3 x 1M)
  1300000, 1300000,                       // Lv17 - Lv18
  4800000,                                // Lv19
  3450000, 3450000, 3450000, 3450000, 3450000, 3450000, // Lv20-25
  6900000, 6900000, 6900000,              // Lv26 - Lv28
  20700000, 20700000, 20700000, 20700000, 20700000,     // Lv29 - Lv33
  48000000, 48000000, 48000000, 48000000, 48000000,     // Lv34 - Lv38
  136800000,                              // Lv39
  72000000, 72000000, 72000000, 72000000, 72000000, 72000000, 72000000, 72000000, // Lv40 - Lv48
  138000000,                              // Lv49
  75600000, 75600000, 75600000, 75600000, 75600000, 75600000, 75600000, 75600000, 75600000, // Lv50 - Lv58
  144000000,                              // Lv59
  82800000, 82800000, 82800000, 82800000, 82800000, 82800000, 82800000, 82800000, 82800000, // Lv60 - Lv68
  150900000,                              // Lv69
  90000000, 90000000, 90000000, 90000000, 90000000, 90000000, 90000000, 90000000, 90000000, // Lv70 - Lv78
  156000000,                              // Lv79
  102000000, 102000000, 102000000, 102000000, 102000000, 102000000, 102000000, 102000000, 102000000, // Lv80 - Lv88
  168000000,                              // Lv89
  120000000, 120000000, 120000000, 120000000, 120000000, 120000000, 120000000, 120000000, 120000000, // Lv90 - Lv98
  180000000,                              // Lv99
  132000000                               // Lv100
];

const calculateLevel = (xp) => {
  let level = 1;
  let accumulatedXp = 0;

  for (let i = 0; i < levelXpMap.length; i++) {
    accumulatedXp += levelXpMap[i];
    if (xp < accumulatedXp) {
      break;
    }
    level++;
  }

  return level > 100 ? 100 : level;
};

const LevelUpdate = async (senderId, receiverId) => {
  const sender = await user.findOne({ ui_id: senderId });
  const receiver = await user.findOne({ ui_id: receiverId });

  if (!sender || !receiver) {
    throw new Error("Sender or receiver not found");
  }

  // Get gift records of sender
  const senderRecords = await giftRecords.find({ senderId });
  const totalGiftsSent = senderRecords.reduce((total, record) => total + record.amount, 0);

  // Get gift records of receiver
  const receiverRecords = await giftRecords.find({ receiverId });
  const totalGiftsReceived = receiverRecords.reduce((total, record) => total + record.amount, 0);

  // Update XP: Add total sent/received as XP
  sender.xp = totalGiftsSent;
  receiver.xp = totalGiftsReceived;

  // Update level based on XP
  sender.level = calculateLevel(sender.xp);
  receiver.level = calculateLevel(receiver.xp);

  await sender.save();
  await receiver.save();

  console.log(`✅ Sender (${sender.ui_id}) XP: ${sender.xp}, Level: ${sender.level}`);
  console.log(`✅ Receiver (${receiver.ui_id}) XP: ${receiver.xp}, Level: ${receiver.level}`);

  return {
    sender: {
      ui_id: sender.ui_id,
      level: sender.level,
      xp: sender.xp
    },
    receiver: {
      ui_id: receiver.ui_id,
      level: receiver.level,
      xp: receiver.xp
    }
  };
};

module.exports = LevelUpdate;
