// =============================================
//  models/Slot.js — Interviewer Availability Slot
// =============================================

const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    // The user who created this slot (the interviewer)
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    // Store times as strings like "10:00", "14:30" for simplicity
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    // Add this right under endTime!
    topics: {
      type: [String],
      default: ["General"]
    },

    // false = available to be booked, true = already booked
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Slot", slotSchema);
