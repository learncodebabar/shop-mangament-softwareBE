const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
//  REMOVE - const { verifyToken, isOwner } = require("../middleware/auth");

// ============================================
//  REMOVE - Token verification
// ============================================
// router.use(verifyToken);

// ============================================
// GET all employees
// ============================================
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("-password -__v")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// CREATE new employee
// ============================================
router.post("/", async (req, res) => {
  //  Remove isOwner
  try {
    const employee = new Employee({
      ...req.body,
    });

    const saved = await employee.save();

    console.log("✅ Employee created:", {
      username: saved.username,
      passwordLength: saved.password.length,
      isHashed: saved.password.startsWith("$2"),
    });

    // Remove password from response
    const response = saved.toObject();
    delete response.password;

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(" Employee creation error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to create employee",
    });
  }
});

// ============================================
// UPDATE employee
// ============================================
router.put("/:id", async (req, res) => {
  //  Remove isOwner
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update fields
    employee.name = req.body.name || employee.name;
    employee.phone = req.body.phone || employee.phone;
    employee.email = req.body.email;
    employee.role = req.body.role || employee.role;
    employee.salary = req.body.salary || employee.salary;
    employee.joinDate = req.body.joinDate || employee.joinDate;
    employee.address = req.body.address;
    employee.cnic = req.body.cnic;
    employee.username = req.body.username || employee.username;
    employee.isActive =
      req.body.isActive !== undefined ? req.body.isActive : employee.isActive;

    if (req.body.password && req.body.password.trim() !== "") {
      employee.password = req.body.password.trim();
      console.log("🔑 Password will be updated and hashed");
    }

    const updated = await employee.save();

    // Remove password from response
    const response = updated.toObject();
    delete response.password;

    console.log("✅ Employee updated:", updated.username);

    res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(" Employee update error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to update employee",
    });
  }
});

// ============================================
// DELETE employee
// ============================================
router.delete("/:id", async (req, res) => {
  //  Remove isOwner
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    console.log("✅ Employee deleted:", deleted.username);

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (err) {
    console.error(" Delete error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
    });
  }
});

// ============================================
// PAY SALARY
// ============================================
router.patch("/:id/pay-salary", async (req, res) => {
  try {
    //  REMOVE - Role check
    // if (!req.user.isOwner && req.user.role !== "manager") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied. Owner or Manager only.",
    //   });
    // }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    if (employee.lastPaidMonth === currentMonth) {
      return res.status(400).json({
        success: false,
        message: "Salary already paid for this month",
      });
    }

    employee.salaryHistory.push({
      amount: employee.salary,
      paidDate: new Date(),
      month: currentMonth,
      status: "paid",
    });

    employee.lastPaidMonth = currentMonth;
    employee.salaryStatus = "paid";

    const updated = await employee.save();

    const response = updated.toObject();
    delete response.password;

    return res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.error("Pay salary error:", err.stack || err);
    return res.status(500).json({
      success: false,
      message: "Failed to process salary payment",
      error: err.message,
    });
  }
});

module.exports = router;
