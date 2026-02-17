const mongoose = require("mongoose");
const { MONGO_URI } = require("../env");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("MONGO_URI value:", MONGO_URI ? "✅ Found" : "❌ Undefined");
    
    if (!MONGO_URI) {
      console.error("❌ MONGO_URI is undefined. Check your env.js file and .env file");
      return; // Don't throw, just return
    }
    
    const conn = await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠ MongoDB Disconnected");
    });
    
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!");
    console.error("   Error Message:", error.message);
    // DON'T exit the process - this crashes on Vercel
    // if (process.env.NODE_ENV !== 'production') {
    //   process.exit(1);
    // }
  }
};

module.exports = connectDB;