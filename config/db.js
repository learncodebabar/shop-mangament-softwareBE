const mongoose = require("mongoose");
const { MONGO_URI } = require("../env");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    
    if (!MONGO_URI) {
      console.error("❌ MONGO_URI is not defined!");
      console.log("Available env vars:", Object.keys(process.env));
      return; // Don't crash, just return
    }
    
    console.log("MONGO_URI found, connecting...");
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB Connected Successfully");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!");
    console.error("   Error Message:", error.message);
    // Don't exit - let the app run even without DB for debugging
    // process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠ MongoDB Disconnected");
  });
};

module.exports = connectDB;