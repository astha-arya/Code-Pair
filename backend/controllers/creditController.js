// =============================================
//  controllers/creditController.js
//  Handles: Get credit balance
// =============================================

const User = require("../models/User");

// ─────────────────────────────────────────────
//  @desc    Get the logged-in user's credit balance
//  @route   GET /api/credits/balance
//  @access  Private (requires JWT)
// ─────────────────────────────────────────────
const getCreditBalance = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id).select("name email credits");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      data: {
        name:    user.name,
        email:   user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching credits." });
  }
};

module.exports = { getCreditBalance };
