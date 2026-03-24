// =============================================
//  server.js — Entry point for Code-Pair API
// =============================================

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// ── Routes ──────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/credits",  require("./routes/creditRoutes"));
app.use("/api/slots",    require("./routes/slotRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

// ── Health check ────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "✅ Code-Pair API is running!" });
});

// ── Global error handler ─────────────────────
// Catches any error passed via next(err) from controllers
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start server ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
