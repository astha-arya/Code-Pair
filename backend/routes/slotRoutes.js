// =============================================
//  routes/slotRoutes.js
// =============================================

const express = require("express");
const router  = express.Router();

const {
  createSlot,
  getAvailableSlots,
  getMySlots,
} = require("../controllers/slotController");

const { protect } = require("../middleware/authMiddleware");

// All slot routes require the user to be logged in
router.use(protect);

// POST /api/slots/create         →  Create an availability slot
router.post("/create", createSlot);

// GET  /api/slots/available      →  View all unbooked slots (excluding yours)
router.get("/available", getAvailableSlots);

// GET  /api/slots/my-slots       →  View slots you created
router.get("/my-slots", getMySlots);

module.exports = router;
