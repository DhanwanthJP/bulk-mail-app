import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        BULK<span>MAILER</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          Compose
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
          History
        </NavLink>
      </div>
    </nav>
  );
}
