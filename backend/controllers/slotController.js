// =============================================
//  controllers/slotController.js
//  Handles: Create slot, View available slots
// =============================================

const Slot = require("../models/Slot");

// ─────────────────────────────────────────────
//  @desc    Create an availability slot
//  @route   POST /api/slots/create
//  @access  Private
// ─────────────────────────────────────────────
const createSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, topics } = req.body;

    // ── 1. Validate required fields ──
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide date, startTime, and endTime.",
      });
    }

    // ── 2. Basic time logic check ──
    // Compare times as strings in "HH:MM" format works for simple validation
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time.",
      });
    }

    // ── 3. Check for overlapping slots for the same interviewer on the same date ──
    // A new slot overlaps an existing slot if:
    //   new startTime < existing endTime  AND  new endTime > existing startTime
    const slotDate = new Date(date);

    const overlapping = await Slot.findOne({
      interviewer: req.user._id,
      // Match slots on the same calendar date
      date: {
        $gte: new Date(slotDate.setHours(0, 0, 0, 0)),
        $lt:  new Date(slotDate.setHours(23, 59, 59, 999)),
      },
      // Overlap condition
      $and: [
        { startTime: { $lt: endTime } },
        { endTime:   { $gt: startTime } },
      ],
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: "This slot overlaps with one of your existing slots.",
      });
    }

    // ── 4. Create the slot ──
    const slot = await Slot.create({
      interviewer: req.user._id,
      date:        new Date(date),
      startTime,
      endTime,
      topics,
    });

    res.status(201).json({
      success: true,
      message: "Slot created successfully.",
      data: slot,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error creating slot." });
  }
};

// ─────────────────────────────────────────────
//  @desc    Get all available (unbooked) slots
//  @route   GET /api/slots/available
//  @access  Private
// ─────────────────────────────────────────────
const getAvailableSlots = async (req, res) => {
  try {
    // Fetch only slots that:
    //   • are not yet booked
    //   • are in the future (date >= today)
    //   • are NOT created by the requesting user themselves
    //     (you shouldn't interview yourself)
    const slots = await Slot.find({
      isBooked: false,
      date:     { $gte: new Date() },
      interviewer: { $ne: req.user._id },
    })
      .populate("interviewer", "name email") // Attach interviewer name/email
      .sort({ date: 1, startTime: 1 });       // Soonest first

    res.status(200).json({
      success: true,
      count: slots.length,
      data:  slots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching slots." });
  }
};

// ─────────────────────────────────────────────
//  @desc    Get all slots created by the logged-in user
//  @route   GET /api/slots/my-slots
//  @access  Private
// ─────────────────────────────────────────────
const getMySlots = async (req, res) => {
  try {
    const slots = await Slot.find({ interviewer: req.user._id }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data:  slots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching your slots." });
  }
};

module.exports = { createSlot, getAvailableSlots, getMySlots };
