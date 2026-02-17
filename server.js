// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expense");

// Connect to MongoDB (but don't crash on Vercel if it fails)
connectDB().catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
});

const app = express();

// ✅ Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Uploads directory created");
}

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/shop-settings", require("./routes/shopSettings"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/locations", require("./routes/locations"));
app.use("/api/expenses", expenseRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Shop Management Backend Running",
    status: "ok",
    time: new Date().toISOString()
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check environment
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Debug info",
    env: process.env.NODE_ENV,
    hasMongoURI: !!process.env.MONGO_URI,
    hasJWT: !!process.env.JWT_SECRET,
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

// ❌ NO app.listen() - This is CRITICAL for Vercel!
// ✅ Instead, export the app
module.exports = app;