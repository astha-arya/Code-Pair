// =============================================
//  models/Booking.js — Interview Booking
// =============================================

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // The user who booked the slot (the interviewee / candidate)
    interviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The interviewer who created the slot
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reference to the booked slot
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },

    // Interview topic chosen by the interviewee
    topic: {
      type: String,
      enum: {
        values: ["DSA", "Web", "HR"],
        message: "Topic must be one of: DSA, Web, HR",
      },
      required: [true, "Interview topic is required"],
    },

    // Booking lifecycle status
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },

    // Tracks whether the interviewer has already received their credit reward.
    // This prevents double-crediting if the endpoint is called more than once.
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
