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
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Admin Panel</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowManageUsersModal(true)}
                >
                  Manage Users
                </button>

                <button
                  className="btn btn-success"
                  onClick={() => setShowAddCourseModal(true)}
                >
                  Add New Course
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
