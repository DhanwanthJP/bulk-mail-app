const express = require("express");
const router = express.Router();
const { sendBulkEmail, getEmailHistory, deleteEmailRecord } = require("../controllers/emailController");

router.post("/send", sendBulkEmail);
router.get("/history", getEmailHistory);
router.delete("/:id", deleteEmailRecord);

module.exports = router;
