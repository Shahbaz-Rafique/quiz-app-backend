
const jwt = require("jsonwebtoken");

// Middleware function to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer header format

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });

    req.user = user; // Add decoded user data to request object
    next(); // Proceed to the next middleware/route handler
  });
};

module.exports = authenticateToken;
