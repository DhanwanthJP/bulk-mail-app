const Email = require("../models/Email");
const transporter = require("../utils/mailer");

// POST /api/emails/send
const sendBulkEmail = async (req, res) => {
  const { subject, body, recipients } = req.body;

  // Basic validation
  if (!subject || !body || !recipients || recipients.length === 0) {
    return res.status(400).json({ message: "Subject, body, and at least one recipient are required." });
  }

  const successList = [];
  const failedList = [];

  // Send email to each recipient individualy
  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: `"Bulk Mailer" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: body,
      });
      successList.push(email);
      console.log(`📧 Sent to: ${email}`);
    } catch (err) {
      failedList.push(email);
      console.error(`❌ Failed to send to ${email}:`, err.message);
    }
  }

  // Determine overall status
  let status = "sent";
  if (successList.length === 0) status = "failed";
  else if (failedList.length > 0) status = "partial";

  // Save record to MongoDB
  try {
    const record = await Email.create({
      subject,
      body,
      recipients,
      status,
      successCount: successList.length,
      failureCount: failedList.length,
      failedRecipients: failedList,
    });

    return res.status(200).json({
      message: `Emails processed. ${successList.length} sent, ${failedList.length} failed.`,
      status,
      successCount: successList.length,
      failureCount: failedList.length,
      failedRecipients: failedList,
      record,
    });
  } catch (dbErr) {
    console.error("❌ DB save error:", dbErr.message);
    return res.status(500).json({ message: "Emails processed but failed to save record.", status });
  }
};

// GET /api/emails/history
const getEmailHistory = async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(emails);
  } catch (err) {
    console.error("❌ Fetch history error:", err.message);
    return res.status(500).json({ message: "Failed to fetch email history." });
  }
};

// DELETE /api/emails/:id
const deleteEmailRecord = async (req, res) => {
  try {
    await Email.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Record deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete record." });
  }
};

module.exports = { sendBulkEmail, getEmailHistory, deleteEmailRecord };
