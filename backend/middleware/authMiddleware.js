// =============================================
//  middleware/authMiddleware.js — JWT Auth Guard
// =============================================

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — middleware that verifies a JWT token.
 *
 * Usage: add `protect` as a middleware before any route handler
 * that requires the user to be logged in.
 *
 * It reads the token from the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success it attaches the logged-in user object to req.user
 * so downstream controllers can access it.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token part (everything after "Bearer ")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from DB using the id stored in the token payload.
      // We exclude the password field for security.
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists. Please log in again.",
        });
      }

      // Pass control to the next middleware / route handler
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }
};

module.exports = { protect };
