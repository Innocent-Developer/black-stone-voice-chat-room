// utils/generateUniqueUIID.js
const AccountCreate = require('../schema/account-create');

async function generateUniqueUIID() {
  let isUnique = false;
  let randomId;

  while (!isUnique) {
    randomId = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    const existing = await AccountCreate.findOne({ ui_id: randomId });
    if (!existing) isUnique = true;
  }

  return randomId;
}

module.exports = generateUniqueUIID;
