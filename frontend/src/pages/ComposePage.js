import React, { useState } from "react";
import { sendEmails } from "../api/emailApi";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ComposePage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { status, message, successCount, failureCount, failedRecipients }
  const [formErrors, setFormErrors] = useState({});

  // Add a recipient tag
  const addRecipient = () => {
    const email = recipientInput.trim();
    if (!email) return;
    if (!isValidEmail(email)) {
      setInputError("Enter a valid email address.");
      return;
    }
    if (recipients.includes(email)) {
      setInputError("This email is already added.");
      return;
    }
    setRecipients((prev) => [...prev, email]);
    setRecipientInput("");
    setInputError("");
  };

  const handleRecipientKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient();
    }
  };

  const removeRecipient = (email) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  // Form validation
  const validate = () => {
    const errors = {};
    if (!subject.trim()) errors.subject = "Subject is required.";
    if (!body.trim()) errors.body = "Email body is required.";
    if (recipients.length === 0) errors.recipients = "Add at least one recipient.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await sendEmails({ subject, body, recipients });
      setResult(res.data);
      // Clear form on full success
      if (res.data.status === "sent") {
        setSubject("");
        setBody("");
        setRecipients([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setResult({ status: "failed", message: msg, successCount: 0, failureCount: recipients.length, failedRecipients: recipients });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubject("");
    setBody("");
    setRecipients([]);
    setRecipientInput("");
    setResult(null);
    setFormErrors({});
    setInputError("");
  };

  return (
    <div className="main-content">
      <h1 className="page-title">Compose Email</h1>
      <p className="page-subtitle">Fill in the details below and send to multiple recipients at once.</p>

      {/* Result alert */}
      {result && (
        <div className={`alert ${result.status === "sent" ? "alert-success" : result.status === "partial" ? "alert-partial" : "alert-error"}`}>
          <div className="alert-title">
            {result.status === "sent" && "✓ All emails sent successfully"}
            {result.status === "partial" && "⚠ Partially sent"}
            {result.status === "failed" && "✗ Failed to send emails"}
          </div>
          <div>{result.message}</div>
          {result.failedRecipients && result.failedRecipients.length > 0 && (
            <ul>
              {result.failedRecipients.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="card">
        {/* Subject */}
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter email subject"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setFormErrors((p) => ({ ...p, subject: "" })); }}
          />
          {formErrors.subject && <p className="form-hint" style={{ color: "#c0392b" }}>{formErrors.subject}</p>}
        </div>

        {/* Body */}
        <div className="form-group">
          <label className="form-label">Email Body</label>
          <textarea
            className="form-textarea"
            placeholder="Write your email content here... (HTML is supported)"
            value={body}
            onChange={(e) => { setBody(e.target.value); setFormErrors((p) => ({ ...p, body: "" })); }}
          />
          {formErrors.body && <p className="form-hint" style={{ color: "#c0392b" }}>{formErrors.body}</p>}
        </div>

        {/* Recipients */}
        <div className="form-group">
          <label className="form-label">Recipients</label>
          <div className="recipient-input-row">
            <input
              type="email"
              className="form-input"
              placeholder="Enter email and press Enter or comma"
              value={recipientInput}
              onChange={(e) => { setRecipientInput(e.target.value); setInputError(""); }}
              onKeyDown={handleRecipientKeyDown}
            />
            <button className="btn-add" onClick={addRecipient}>Add</button>
          </div>
          {inputError && <p className="form-hint" style={{ color: "#c0392b" }}>{inputError}</p>}
          {formErrors.recipients && <p className="form-hint" style={{ color: "#c0392b" }}>{formErrors.recipients}</p>}

          {recipients.length > 0 && (
            <div className="tags-container">
              {recipients.map((r) => (
                <span key={r} className="tag">
                  {r}
                  <button className="tag-remove" onClick={() => removeRecipient(r)} title="Remove">×</button>
                </span>
              ))}
            </div>
          )}
          {recipients.length > 0 && (
            <p className="form-hint" style={{ marginTop: 8 }}>{recipients.length} recipient{recipients.length > 1 ? "s" : ""} added.</p>
          )}
        </div>

        {/* {Actions} */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
            Clear
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending…" : `Send to ${recipients.length > 0 ? recipients.length : ""} Recipient${recipients.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
