// Navigation bar component with admin panel access and logout

import { useState } from "react";
import type { User } from "../../types";
import { AdminPanel } from "./admin/AdminPanel";

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onRefresh?: () => void;
}

export function Navbar({ user, onLogout, onRefresh }: NavbarProps) {
  // State for admin panel visibility
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  // State for mobile nav toggle
  const [navExpanded, setNavExpanded] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 fw-bold">TechCourses4U</span>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setNavExpanded(!navExpanded)}
            aria-expanded={navExpanded}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse ${navExpanded ? "show" : ""}`}
          >
            <div className="navbar-nav ms-auto align-items-lg-center mt-2 mt-lg-0">
              <span className="navbar-text py-2 me-lg-3 text-truncate">
                {user.first_name} {user.last_name}
                {user.job_title ? ` — ${user.job_title}` : ""}
              </span>
              <div className="d-flex gap-2 pb-2 pb-lg-0 flex-wrap">
                {user.role === "admin" && (
                  <button
                    onClick={() => {
                      setShowAdminPanel(true);
                      setNavExpanded(false);
                    }}
                    className="btn btn-light"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    setNavExpanded(false);
                    onLogout();
                  }}
                  className="btn btn-light"
                >
                  Logout
                </button>
              </div>
            </div>
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
