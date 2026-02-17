const mongoose = require("mongoose");
const { MONGO_URI } = require("../env");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("MONGO_URI value:", MONGO_URI ? "✅ Found" : "❌ Undefined");
    
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check your env.js file and .env file");
    }
    
    const conn = await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!");
    console.error("   Error Message:", error.message);
    // Don't exit in production (Vercel)
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠ MongoDB Disconnected");
  });
};

module.exports = connectDB;