import axios from "axios";

const api = axios.create({
  baseURL: "/api/emails",
  headers: { "Content-Type": "application/json" },
});

export const sendEmails = (data) => api.post("/send", data);
export const fetchHistory = () => api.get("/history");
export const deleteEmail = (id) => api.delete(`/${id}`);
