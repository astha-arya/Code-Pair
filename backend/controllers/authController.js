// =============================================
//  controllers/authController.js
//  Handles: Register & Login
// =============================================

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: Generate a JWT token for a user ──
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },               // Payload — store the user's MongoDB _id
    process.env.JWT_SECRET,       // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // Expiry
  );
};

// ─────────────────────────────────────────────
//  @desc    Register a new user
//  @route   POST /api/auth/register
//  @access  Public
// ─────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── 1. Validate required fields ──
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    // ── 2. Check if email is already registered ──
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ── 3. Create user (password hashing happens in the User model pre-save hook) ──
    const user = await User.create({ name, email, password });

    // ── 4. Return the new user info and a JWT token ──
    res.status(201).json({
      success: true,
      message: "Account created successfully! You start with 2 credits.",
      data: {
        _id:     user._id,
        name:    user.name,
        email:   user.email,
        credits: user.credits,
        token:   generateToken(user._id),
      },
    });
  } catch (error) {
    // Mongoose validation errors (e.g., invalid email format)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// ─────────────────────────────────────────────
//  @desc    Login user and return token
//  @route   POST /api/auth/login
//  @access  Public
// ─────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── 1. Validate required fields ──
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // ── 2. Find user by email (include password for comparison) ──
    // We normally exclude password in queries (select: false in schema),
    // but here we need it to verify the entered password.
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      // Use a generic message — don't reveal whether email exists
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── 3. Compare entered password with hashed password ──
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── 4. Return user info and JWT token ──
    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        _id:     user._id,
        name:    user.name,
        email:   user.email,
        credits: user.credits,
        token:   generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};

module.exports = { registerUser, loginUser };
