const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// Report route
router.get("/report", async (req, res) => {
  try {
    const { start, end } = req.query;

    // Set up date range
    let startDate, endDate;
    if (start && end) {
      startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    }

    // Calculate Recovered Credit
    let recoveredAmount = 0;
    if (startDate && endDate) {
      const recoveredAgg = await Sale.aggregate([
        { $match: { saleType: { $ne: "cash" } } },
        { $unwind: "$payments" },
        {
          $match: {
            "payments.date": {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$payments.amount" } } },
      ]);

      recoveredAmount = recoveredAgg[0]?.total || 0;

      // Debug log
      console.log("=== REPORT DEBUG ===");
      console.log("Date Range:", { start, end });
      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);
      console.log("Recovered Aggregation Result:", recoveredAgg);
      console.log("Recovered Amount:", recoveredAmount);
    }

    // Get sales data based on sale createdAt
    const salesQuery = {};
    if (startDate && endDate) {
      salesQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    const sales = await Sale.find(salesQuery);

    const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const cashSales = sales
      .filter((s) => s.saleType === "cash")
      .reduce((sum, s) => sum + (s.total || 0), 0);
    const creditSales = totalSales - cashSales;

    // Top products
    const productMap = {};
    sales.forEach((s) => {
      s.items.forEach((i) => {
        const name = i.name || "Unknown Item";
        if (!productMap[name]) productMap[name] = { qty: 0, revenue: 0 };
        productMap[name].qty += i.qty || 0;
        productMap[name].revenue += (i.price || 0) * (i.qty || 0);
      });
    });

    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Current total remaining credit
    const customers = await Customer.find();
    const permanentRemaining = customers.reduce(
      (sum, c) => sum + (c.remainingDue || 0),
      0,
    );

    const allTempSales = await Sale.find({ saleType: "temporary" });
    const temporaryRemaining = allTempSales.reduce(
      (sum, s) => sum + ((s.total || 0) - (s.paidAmount || 0)),
      0,
    );

    const response = {
      totalSales,
      cashSales,
      creditSales,
      recoveredAmount,
      saleCount: sales.length,
      cashCount: sales.filter((s) => s.saleType === "cash").length,
      creditCount: sales.filter((s) => s.saleType !== "cash").length,
      profit: totalSales * 0.3,
      topProducts,
      permanentRemaining,
      temporaryRemaining,
    };

    console.log("=== SENDING RESPONSE ===");
    console.log("Recovered Amount in Response:", response.recoveredAmount);

    res.json(response);
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Report error: " + err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();

    // Deduct stock
    for (let item of req.body.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    if (req.body.saleType === "permanent" && req.body.customer) {
      await Customer.findByIdAndUpdate(req.body.customer, {
        $inc: { totalPurchases: req.body.total, remainingDue: req.body.total },
      });
    }

    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name phone type")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (err) {
    console.error("GET sales error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updated = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
