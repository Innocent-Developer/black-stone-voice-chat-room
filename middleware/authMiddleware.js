// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"]; // Format: Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied: No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    req.user = { id: decoded.id, role: decoded.role || "" };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
