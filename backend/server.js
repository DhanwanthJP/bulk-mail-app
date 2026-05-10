const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const emailRoutes = require("./routes/emailRoutes");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/emails", emailRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Bulk Mail API is running." });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
