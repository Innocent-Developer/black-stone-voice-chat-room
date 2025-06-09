const AccountCreate = require("../schema/account-create");

const getAlluser = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await AccountCreate.find({}, "-password -resetPasswordOtp -otpExpiration");

    // Check if users were found
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }
    
    // Return the list of users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = getAlluser;