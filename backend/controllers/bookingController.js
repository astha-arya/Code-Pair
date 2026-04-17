// =============================================
//  controllers/bookingController.js
//  Handles: Book, Complete, Cancel interviews
// =============================================

const Booking = require("../models/Booking");
const Slot    = require("../models/Slot");
const User    = require("../models/User");

// --- HELPER: Convert AM/PM to Military Time for Math ---
const timeToMilitary = (timeStr) => {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  let hr = parseInt(hours, 10);
  if (modifier === 'PM' && hr !== 12) hr += 12;
  if (modifier === 'AM' && hr === 12) hr = 0;
  return (hr * 100) + parseInt(minutes, 10);
};

// ─────────────────────────────────────────────
//  @desc    Book an interview slot
//  @route   POST /api/bookings/book
//  @access  Private
// ─────────────────────────────────────────────
const bookInterview = async (req, res) => {
  try {
    const { slotId, topic } = req.body;

    if (!slotId || !topic) {
      return res.status(400).json({ success: false, message: "Please provide slotId and topic." });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found." });

    if (slot.isBooked) {
      return res.status(409).json({ success: false, message: "This slot has already been booked." });
    }

    if (slot.interviewer.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot book your own slot." });
    }

    const existingBooking = await Booking.findOne({
      interviewee: req.user._id,
      slot: slotId,
      status: "upcoming",
    });
    
    if (existingBooking) {
      return res.status(409).json({ success: false, message: "You have already booked this slot." });
    }

    // ── 6. BULLETPROOF OVERLAP CHECK ──
    const myUpcomingBookings = await Booking.find({
      $or: [{ interviewee: req.user._id }, { interviewer: req.user._id }],
      status: "upcoming"
    }).populate("slot");

    // NEW: Check if I am already hosting an open slot at this time!
    const myOpenSlots = await Slot.find({
      interviewer: req.user._id,
      isBooked: false
    });

    const newStart = timeToMilitary(slot.startTime);
    const newEnd = timeToMilitary(slot.endTime);
    const newDateStr = new Date(slot.date).toISOString().split('T')[0]; 

    // Check against Bookings
    const isDoubleBooked = myUpcomingBookings.some(booking => {
      if (!booking.slot) return false;
      const existingDateStr = new Date(booking.slot.date).toISOString().split('T')[0];
      if (existingDateStr !== newDateStr) return false; 
      const existingStart = timeToMilitary(booking.slot.startTime);
      const existingEnd = timeToMilitary(booking.slot.endTime);
      return newStart < existingEnd && newEnd > existingStart;
    });

    // Check against Open Hosted Slots
    const isOverlappingOpenSlot = myOpenSlots.some(mySlot => {
      const existingDateStr = new Date(mySlot.date).toISOString().split('T')[0];
      if (existingDateStr !== newDateStr) return false; 
      const existingStart = timeToMilitary(mySlot.startTime);
      const existingEnd = timeToMilitary(mySlot.endTime);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (isDoubleBooked || isOverlappingOpenSlot) {
      return res.status(409).json({
        success: false,
        message: "You already have another session or open slot scheduled at this exact time!",
      });
    }

    // ── 7. Process Credits & Book ──
    const interviewee = await User.findById(req.user._id);
    if (interviewee.credits < 1) {
      return res.status(402).json({ success: false, message: "Insufficient credits." });
    }

    interviewee.credits -= 1;
    await interviewee.save();

    slot.isBooked = true;
    await slot.save();

    const booking = await Booking.create({
      interviewee:  req.user._id,
      interviewer:  slot.interviewer,
      slot:         slotId,
      topic,
      status:       "upcoming",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("interviewee", "name email")
      .populate("interviewer", "name email")
      .populate("slot", "date startTime endTime");

    res.status(201).json({ success: true, message: `Interview booked! 1 credit deducted.`, data: populatedBooking });
  } catch (error) {
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
    if (!booking.creditAwarded) {
      await User.findByIdAndUpdate(booking.interviewer, {
        $inc: { credits: 1 }, 
      });
      booking.creditAwarded = true;
    }

    await booking.save();

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
    const bookings = await Booking.find({
      $or: [
        { interviewee: req.user._id },
        { interviewer: req.user._id },
      ],
    })
      .populate("interviewee", "name email")
      .populate("interviewer", "name email")
      .populate("slot", "date startTime endTime")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: bookings.length,
      data:  bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching bookings." });
  }
};

// ─────────────────────────────────────────────
//  @desc    Submit a 5-star rating and optional feedback
//  @route   PATCH /api/bookings/:bookingId/rate
//  @access  Private (interviewee or interviewer)
// ─────────────────────────────────────────────
const rateInterview = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const bookingId = req.params.bookingId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Please provide a rating between 1 and 5." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "You can only rate completed interviews." });
    }

    const isInterviewee = booking.interviewee.toString() === req.user._id.toString();
    const isInterviewer = booking.interviewer.toString() === req.user._id.toString();

    if (isInterviewee) {
      if (booking.hostRating) return res.status(400).json({ success: false, message: "You have already rated this session." });
      booking.hostRating = rating; 
    } else if (isInterviewer) {
      if (booking.studentRating) return res.status(400).json({ success: false, message: "You have already rated this session." });
      booking.studentRating = rating; 
      if (feedback) booking.feedback = feedback; 
    } else {
      return res.status(403).json({ success: false, message: "Not authorized to rate this session." });
    }

    await booking.save();
    res.status(200).json({ success: true, message: "Feedback submitted successfully!", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error submitting rating." });
  }
};

module.exports = {
  bookInterview,
  cancelInterview,
  getMyBookings,
  completeInterview,
  rateInterview,
};