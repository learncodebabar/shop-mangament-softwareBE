const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// GET all permanent customers with totalCredit calculated
router.get("/permanent", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });

    // Calculate totalCredit for each customer from their sales
    const customersWithCredit = await Promise.all(
      customers.map(async (customer) => {
        // Get all sales for this customer
        const sales = await Sale.find({
          customer: customer._id,
          saleType: "permanent",
        });

        // Calculate total credit from all sales
        const totalCredit = sales.reduce(
          (sum, sale) => sum + (sale.total || 0),
          0,
        );

        // Return customer with totalCredit field
        return {
          ...customer.toObject(),
          totalCredit: totalCredit,
        };
      }),
    );

    res.json(customersWithCredit);
  } catch (err) {
    console.error("GET permanent error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Add new permanent customer
router.post("/permanent", async (req, res) => {
  try {
    const customer = new Customer({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email || "",
      gender: req.body.gender || "male",
      address: req.body.address || "",
      cnic: req.body.cnic || "",
      creditLimit: Number(req.body.creditLimit) || 50000,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      totalPurchases: 0,
      totalPaid: 0,
      remainingDue: 0,
    });

    const newCustomer = await customer.save();

    // Add totalCredit field (0 for new customer)
    const customerWithCredit = {
      ...newCustomer.toObject(),
      totalCredit: 0,
    };

    res.status(201).json(customerWithCredit);
  } catch (err) {
    console.error("POST customer error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Record payment
router.post("/:id/payment", async (req, res) => {
  try {
    const { amount, method = "cash", detail = "", saleId } = req.body;

    if (!saleId) {
      return res
        .status(400)
        .json({ message: "saleId is required for payment" });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    if (sale.customer?.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Sale does not belong to this customer" });
    }

    const paymentAmount = Number(amount);
    if (paymentAmount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    sale.payments.push({
      method,
      amount: paymentAmount,
      detail,
      date: new Date(),
    });

    sale.paidAmount = (sale.paidAmount || 0) + paymentAmount;

    await sale.save();

    // Customer update
    customer.totalPaid += paymentAmount;
    customer.remainingDue = Math.max(0, customer.remainingDue - paymentAmount);

    const updatedCustomer = await customer.save();

    // Calculate totalCredit from all sales
    const sales = await Sale.find({
      customer: customer._id,
      saleType: "permanent",
    });
    const totalCredit = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);

    // Add totalCredit to response
    const customerWithCredit = {
      ...updatedCustomer.toObject(),
      totalCredit: totalCredit,
    };

    res.json({
      message: "Payment recorded successfully",
      customer: customerWithCredit,
      sale: sale,
    });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(400).json({ message: err.message });
  }
});

// GET customer credit sales history with date filter
router.get("/:id/sales", async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = {
      customer: req.params.id,
      saleType: "permanent",
    };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .populate("items.product", "name price");

    res.json(sales);
  } catch (err) {
    console.error("GET customer sales error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = router;
