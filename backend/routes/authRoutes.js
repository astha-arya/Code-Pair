// =============================================
//  routes/authRoutes.js
// =============================================

const express = require("express");
const router  = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");

// POST /api/auth/register  →  Create a new account
router.post("/register", registerUser);

// POST /api/auth/login  →  Login and get a JWT token
router.post("/login", loginUser);

module.exports = router;
