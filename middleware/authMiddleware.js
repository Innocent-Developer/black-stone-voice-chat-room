// middleware/authMiddleware.js

module.exports = function (req, res, next) {
  const userId = req.header("userId"); // or from body or query

  if (!userId) {
    return res.status(401).json({ message: "Access denied: userId is required" });
  }

  req.user = { id: userId , role: "" }; // Example user object, in real scenarios fetch from DB
  next();
};
