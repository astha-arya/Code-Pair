// =============================================
//  routes/authRoutes.js
// =============================================

const express = require("express");
const router  = express.Router();

const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // Import the security guard

console.log("Is getUserProfile working?:", typeof getUserProfile);
console.log("Is protect working?:", typeof protect);
// POST /api/auth/register  →  Create a new account
router.post("/register", registerUser);

// POST /api/auth/login  →  Login and get a JWT token
router.post("/login", loginUser);

// GET /api/auth/me  →  Get real-time user data (like credits)
router.get("/me", protect, getUserProfile); 

module.exports = router;