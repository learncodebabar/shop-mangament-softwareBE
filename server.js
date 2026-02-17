const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expense");
const { PORT } = require("./env");

// Connect DB (but don't let it crash the app)
connectDB().catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
});

const app = express();

// ✅ IMPORTANT: Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Uploads directory created");
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
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
  });
});

// Debug endpoint
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Debug info",
    env: process.env.NODE_ENV,
    hasMongoURI: !!process.env.MONGO_URI,
    hasJWT: !!process.env.JWT_SECRET,
    nodeVersion: process.version
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

// ❌ REMOVE THIS ENTIRE BLOCK - THIS IS CAUSING THE CRASH!
// const MYPORT = PORT || 3000;
// app.listen(MYPORT, () => {
//   console.log(`✅ Server running on port ${MYPORT}`);
// });

// ✅ EXPORT the app for Vercel (THIS IS CRITICAL!)
module.exports = app;