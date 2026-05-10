import React, { useEffect, useState } from "react";
import { fetchHistory, deleteEmail } from "../api/emailApi";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function RecipientCell({ recipients }) {
  const [expanded, setExpanded] = useState(false);
  if (recipients.length <= 2) {
    return (
      <div className="recipient-list">
        {recipients.map((r) => <div key={r}>{r}</div>)}
      </div>
    );
  }
  return (
    <div className="recipient-list">
      {(expanded ? recipients : recipients.slice(0, 2)).map((r) => <div key={r}>{r}</div>)}
      <span className="more" onClick={() => setExpanded((p) => !p)}>
        {expanded ? "show less" : `+${recipients.length - 2} more`}
      </span>
    </div>
  );
}

export default function HistoryPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchHistory();
      setEmails(res.data);
    } catch {
      setError("Failed to load email history. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this email record?")) return;
    setDeletingId(id);
    try {
      await deleteEmail(id);
      setEmails((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  // Summary stats
  const totalSent = emails.reduce((a, e) => a + (e.successCount || 0), 0);
  const totalFailed = emails.reduce((a, e) => a + (e.failureCount || 0), 0);

  return (
    <div className="main-content">
      <h1 className="page-title">Email History</h1>
      <p className="page-subtitle">Records of all previously sent bulk emails (last 50).</p>

      {/* Stats */}
      {!loading && emails.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Campaigns</div>
            <div className="stat-value">{emails.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Emails Delivered</div>
            <div className="stat-value" style={{ color: "#2e7d32" }}>{totalSent}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Emails Failed</div>
            <div className="stat-value" style={{ color: totalFailed > 0 ? "#c0392b" : "inherit" }}>{totalFailed}</div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="toolbar" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span className="toolbar-title">
            {loading ? "Loading…" : `${emails.length} record${emails.length !== 1 ? "s" : ""}`}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={loadHistory} disabled={loading}>
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ margin: "16px 20px" }}>
            {error}
          </div>
        )}

        {loading && <div className="loading-row">Loading history…</div>}

        {!loading && emails.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No emails sent yet. Go to <strong>Compose</strong> to send your first bulk email.</div>
          </div>
        )}

        {!loading && emails.length > 0 && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Recipients</th>
                <th>Sent / Failed</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email._id}>
                  <td>
                    <div style={{ fontWeight: 500, maxWidth: 180, wordBreak: "break-word" }}>{email.subject}</div>
                  </td>
                  <td>
                    <RecipientCell recipients={email.recipients} />
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                    <span style={{ color: "#2e7d32" }}>{email.successCount}</span>
                    {" / "}
                    <span style={{ color: email.failureCount > 0 ? "#c0392b" : "inherit" }}>{email.failureCount}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${email.status}`}>{email.status}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatDate(email.createdAt)}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(email._id)}
                      disabled={deletingId === email._id}
                    >
                      {deletingId === email._id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
