import { useState } from "react";
import type { User } from "../types";
import { AdminPanel } from "./AdminPanel";

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onRefresh?: () => void;
}

export function Navbar({ user, onLogout, onRefresh }: NavbarProps) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark  shadow-sm"
        style={{
          background: "linear-gradient(135deg, #2d5a8c 0%, #1e3a5f 100%)",
        }}
      >
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1 fw-bold">Course Portal</span>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              <span className="text-white fw-semibold me-2">{user.name}</span>
              <span className="text-white-50 small">{user.role}</span>
            </div>
            {user.role === "admin" && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="btn btn-outline-light btn-sm"
                title="Admin Panel"
              >
                <i className="bi bi-gear-fill me-1"></i>
                Admin
              </button>
            )}
            <button onClick={onLogout} className="btn btn-outline-light btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <AdminPanel
        show={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onRefresh={onRefresh}
      />
    </>
  );
}
