const mongoose = require("mongoose");
const { MONGO_URI } = require("../env");


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!");
    console.error("   Error Message:", error.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠ MongoDB Disconnected");
  });
};

module.exports = connectDB;
