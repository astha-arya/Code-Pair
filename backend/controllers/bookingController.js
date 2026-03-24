// =============================================
//  controllers/bookingController.js
//  Handles: Book, Complete, Cancel interviews
// =============================================

const Booking = require("../models/Booking");
const Slot    = require("../models/Slot");
const User    = require("../models/User");

// ─────────────────────────────────────────────
//  @desc    Book an interview slot
//  @route   POST /api/bookings/book
//  @access  Private
// ─────────────────────────────────────────────
const bookInterview = async (req, res) => {
  try {
    const { slotId, topic } = req.body;

    // ── 1. Validate required fields ──
    if (!slotId || !topic) {
      return res.status(400).json({
        success: false,
        message: "Please provide slotId and topic (DSA | Web | HR).",
      });
    }

    // ── 2. Find the slot ──
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found." });
    }

    // ── 3. Make sure the slot isn't already booked ──
    if (slot.isBooked) {
      return res.status(409).json({
        success: false,
        message: "This slot has already been booked by someone else.",
      });
    }

    // ── 4. Prevent self-booking ──
    if (slot.interviewer.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own slot.",
      });
    }

    // ── 5. Check if the user already booked this same slot (double-booking guard) ──
    const existingBooking = await Booking.findOne({
      interviewee: req.user._id,
      slot: slotId,
      status: "upcoming",
    });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "You have already booked this slot.",
      });
    }

    // ── 6. Check if the user has at least 1 credit ──
    const interviewee = await User.findById(req.user._id);
    if (interviewee.credits < 1) {
      return res.status(402).json({
        success: false,
        message: "Insufficient credits. You need at least 1 credit to book an interview.",
      });
    }

    // ── 7. Deduct 1 credit from the interviewee ──
    interviewee.credits -= 1;
    await interviewee.save();

    // ── 8. Mark the slot as booked ──
    slot.isBooked = true;
    await slot.save();

    // ── 9. Create the booking record ──
    const booking = await Booking.create({
      interviewee:  req.user._id,
      interviewer:  slot.interviewer,
      slot:         slotId,
      topic,
      status:       "upcoming",
    });

    // Populate for a friendlier response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("interviewee", "name email")
      .populate("interviewer", "name email")
      .populate("slot", "date startTime endTime");

    res.status(201).json({
      success: true,
      message: `Interview booked! 1 credit deducted. You now have ${interviewee.credits} credit(s).`,
      data: populatedBooking,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error booking interview." });
  }
};

// ─────────────────────────────────────────────
//  @desc    Mark an interview as completed; reward interviewer
//  @route   PATCH /api/bookings/:bookingId/complete
//  @access  Private (only the interviewer should call this)
// ─────────────────────────────────────────────
const completeInterview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // ── 1. Only the interviewer can mark it as complete ──
    if (booking.interviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the interviewer can mark this interview as completed.",
      });
    }

    // ── 2. Make sure it hasn't already been completed or cancelled ──
    if (booking.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: `This booking is already marked as "${booking.status}".`,
      });
    }

    // ── 3. Mark as completed ──
    booking.status = "completed";

    // ── 4. Award 1 credit to the interviewer — only if not already awarded ──
    // The creditAwarded flag prevents double-crediting
    if (!booking.creditAwarded) {
      await User.findByIdAndUpdate(booking.interviewer, {
        $inc: { credits: 1 }, // MongoDB atomic increment — safe and clean
      });
      booking.creditAwarded = true;
    }

    await booking.save();

    // Fetch updated interviewer credits to include in response
    const interviewer = await User.findById(req.user._id).select("credits");

    res.status(200).json({
      success: true,
      message: `Interview marked as completed. +1 credit awarded! You now have ${interviewer.credits} credit(s).`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error completing interview." });
  }
};

// ─────────────────────────────────────────────
//  @desc    Cancel a booking
//  @route   PATCH /api/bookings/:bookingId/cancel
//  @access  Private (interviewee or interviewer can cancel)
// ─────────────────────────────────────────────
const cancelInterview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // ── 1. Only the interviewee or interviewer can cancel ──
    const isInterviewee = booking.interviewee.toString() === req.user._id.toString();
    const isInterviewer = booking.interviewer.toString() === req.user._id.toString();

    if (!isInterviewee && !isInterviewer) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking.",
      });
    }

    // ── 2. Only upcoming bookings can be cancelled ──
    if (booking.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already "${booking.status}".`,
      });
    }

    // ── 3. Mark booking as cancelled ──
    booking.status = "cancelled";
    await booking.save();

    // ── 4. Free up the slot (mark it as available again) ──
    await Slot.findByIdAndUpdate(booking.slot, { isBooked: false });

    // ── 5. Restore 1 credit to the interviewee ──
    await User.findByIdAndUpdate(booking.interviewee, {
      $inc: { credits: 1 },
    });

    // Fetch updated credits for the response
    const interviewee = await User.findById(booking.interviewee).select("credits");

    res.status(200).json({
      success: true,
      message: `Booking cancelled. 1 credit restored to the interviewee. They now have ${interviewee.credits} credit(s).`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error cancelling interview." });
  }
};

// ─────────────────────────────────────────────
//  @desc    Get all bookings for the logged-in user
//  @route   GET /api/bookings/my-bookings
//  @access  Private
// ─────────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    // Return bookings where the user is either the interviewee or the interviewer
    const bookings = await Booking.find({
      $or: [
        { interviewee: req.user._id },
        { interviewer: req.user._id },
      ],
    })
      .populate("interviewee", "name email")
      .populate("interviewer", "name email")
      .populate("slot", "date startTime endTime")
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: bookings.length,
      data:  bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching bookings." });
  }
};

module.exports = {
  bookInterview,
  cancelInterview,
  getMyBookings,
};
