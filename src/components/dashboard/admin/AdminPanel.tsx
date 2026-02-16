// Admin panel modal providing access to user and course management features

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
  // State for managing nested modal visibility
  const [modals, setModals] = useState({
    addUser: false,
    addCourse: false,
    manageUsers: false,
  });

  // Open specific modal
  const openModal = (modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: true }));
  };

  // Close specific modal
  const closeModal = (modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: false }));
  };

  // Handle user creation completion
  const handleUserAdded = () => {
    closeModal("addUser");
    onRefresh?.();
  };

  // Handle course creation completion
  const handleCourseAdded = () => {
    closeModal("addCourse");
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
                  onClick={() => openModal("manageUsers")}
                >
                  Manage Users
                </button>

                <button
                  className="btn btn-success"
                  onClick={() => openModal("addCourse")}
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
        show={modals.manageUsers}
        onClose={() => closeModal("manageUsers")}
        onRefresh={onRefresh}
      />
      <AddUserModal
        show={modals.addUser}
        onClose={() => closeModal("addUser")}
        onUserAdded={handleUserAdded}
      />
      <AddCourseModal
        show={modals.addCourse}
        onClose={() => closeModal("addCourse")}
        onCourseAdded={handleCourseAdded}
      />
    </>
  );
}
