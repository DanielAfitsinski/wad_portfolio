import { useState } from "react";
import type { User } from "../../types";
import { AdminPanel } from "./admin/AdminPanel";

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onRefresh?: () => void;
}

export function Navbar({ user, onLogout, onRefresh }: NavbarProps) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 fw-bold">TechCourses4U</span>

          <div className="d-flex align-items-center">
            <span className="navbar-text me-3">
              {user.first_name} {user.last_name} - {user.job_title}
            </span>
            {user.role === "admin" && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="btn btn-light me-2"
              >
                Admin
              </button>
            )}
            <button onClick={onLogout} className="btn btn-light">
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
