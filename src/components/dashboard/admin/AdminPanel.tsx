import { useState } from "react";
import { AddUserModal } from "./AddUserModal";
import { AddCourseModal } from "./AddCourseModal";
import { ManageUsersModal } from "./ManageUsersModal";

interface AdminPanelProps {
  show: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function AdminPanel({ show, onClose, onRefresh }: AdminPanelProps) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showManageUsersModal, setShowManageUsersModal] = useState(false);

  const handleUserAdded = () => {
    setShowAddUserModal(false);
    onRefresh?.();
  };

  const handleCourseAdded = () => {
    setShowAddCourseModal(false);
    onRefresh?.();
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{
                background: "linear-gradient(135deg, #2d5a8c 0%, #1e3a5f 100%)",
              }}
            >
              <h5 className="modal-title text-white">
                <i className="bi bi-gear-fill me-2"></i>
                Admin Panel
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-grid gap-3">
                <button
                  className="btn btn-lg btn-outline-primary d-flex align-items-center justify-content-between"
                  onClick={() => setShowManageUsersModal(true)}
                >
                  <span>
                    <i className="bi bi-people-fill me-2"></i>
                    Manage Users
                  </span>
                  <i className="bi bi-chevron-right"></i>
                </button>

                <button
                  className="btn btn-lg btn-outline-success d-flex align-items-center justify-content-between"
                  onClick={() => setShowAddCourseModal(true)}
                >
                  <span>
                    <i className="bi bi-plus-circle-fill me-2"></i>
                    Add New Course
                  </span>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <ManageUsersModal
        show={showManageUsersModal}
        onClose={() => setShowManageUsersModal(false)}
        onRefresh={onRefresh}
      />
      <AddUserModal
        show={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />
      <AddCourseModal
        show={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        onCourseAdded={handleCourseAdded}
      />
    </>
  );
}
