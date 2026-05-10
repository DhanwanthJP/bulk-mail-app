const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter config on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mail transporter error:", error.message);
  } else {
    console.log("✅ Mail transporter ready");
  }
});

module.exports = transporter;
