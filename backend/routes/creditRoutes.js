// =============================================
//  routes/creditRoutes.js
// =============================================

const express = require("express");
const router  = express.Router();

const { getCreditBalance } = require("../controllers/creditController");
const { protect }          = require("../middleware/authMiddleware");

// GET /api/credits/balance  →  Get current credit balance (must be logged in)
router.get("/balance", protect, getCreditBalance);

module.exports = router;
