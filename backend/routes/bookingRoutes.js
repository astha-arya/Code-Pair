// =============================================
//  routes/bookingRoutes.js
// =============================================

const express = require("express");
const router  = express.Router();

const {
  bookInterview,
  cancelInterview,
  getMyBookings,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

// All booking routes require the user to be logged in
router.use(protect);

// POST  /api/bookings/book                    →  Book an interview slot
router.post("/book", bookInterview);

// GET   /api/bookings/my-bookings             →  Get all my bookings (as interviewee or interviewer)
router.get("/my-bookings", getMyBookings);

// PATCH /api/bookings/:bookingId/complete     →  Mark interview as completed (interviewer only)
//router.patch("/:bookingId/complete", completeInterview);

// PATCH /api/bookings/:bookingId/cancel       →  Cancel an interview
router.patch("/:bookingId/cancel", cancelInterview);

module.exports = router;
