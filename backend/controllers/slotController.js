// =============================================
//  controllers/slotController.js
//  Handles: Create slot, View available slots
// =============================================

const Slot = require("../models/Slot");

// Helper function to safely convert "01:00 PM" into integer 1300
const timeToMilitary = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  let hr = parseInt(hours, 10);
  if (modifier === 'PM' && hr !== 12) hr += 12;
  if (modifier === 'AM' && hr === 12) hr = 0;
  return (hr * 100) + parseInt(minutes, 10);
};

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

    // ── 2. Foolproof mathematical time check ──
    const startNum = timeToMilitary(startTime);
    const endNum = timeToMilitary(endTime);

    if (startNum >= endNum) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time.",
      });
    }

    // ── 3. Check for overlapping slots using strict math ──
    const slotDate = new Date(date);

    // Get all slots for this user on this exact calendar day
    const slotsOnDate = await Slot.find({
      interviewer: req.user._id,
      date: {
        $gte: new Date(slotDate.setHours(0, 0, 0, 0)),
        $lt:  new Date(slotDate.setHours(23, 59, 59, 999)),
      }
    });

    // Check if the new times intersect with any existing times
    const isOverlapping = slotsOnDate.some(slot => {
      const existingStart = timeToMilitary(slot.startTime);
      const existingEnd = timeToMilitary(slot.endTime);
      return startNum < existingEnd && endNum > existingStart;
    });

    if (isOverlapping) {
      return res.status(409).json({
        success: false,
        message: "This slot overlaps with one of your existing slots.",
      });
    }

    // ── 4. Create the slot ──
    const slot = await Slot.create({
      interviewer: req.user._id,
      date:        new Date(date), // Saves midnight of the selected date
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
    console.error(error);
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
    // Reset "today" to midnight so slots scheduled for later today still show up
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      isBooked: false,
      date:     { $gte: today },
      interviewer: { $ne: req.user._id },
    })
      .populate("interviewer", "name email") 
      .sort({ date: 1, startTime: 1 });       

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