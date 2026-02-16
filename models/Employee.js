const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    role: {
      type: String,
      enum: ["manager", "cashier", "stock_keeper"],
      default: "cashier",
    },
    salary: { type: Number, required: true },
    joinDate: Date,
    address: String,
    cnic: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    salaryStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    salaryHistory: [
      {
        amount: { type: Number, required: true },
        paidDate: { type: Date, default: Date.now },
        month: { type: String },
        status: { type: String, enum: ["paid", "pending"], default: "paid" },
      },
    ],
    lastPaidMonth: { type: String },
  },
  { timestamps: true },
);

// Password hashing
EmployeeSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("🔒 Password hashed successfully for:", this.username);
  } catch (err) {
    console.error("❌ Password hashing error:", err);
    throw err;
  }
});

// Compare password method
EmployeeSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model("Employee", EmployeeSchema);
