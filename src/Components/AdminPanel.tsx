import { useState } from "react";
import { AddUserModal } from "./AddUserModal";
import { AssignCourseModal } from "./AssignCourseModal";
import { UnassignCourseModal } from "./UnassignCourseModal";

interface AdminPanelProps {
  show: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function AdminPanel({ show, onClose, onRefresh }: AdminPanelProps) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
  const [showUnassignCourseModal, setShowUnassignCourseModal] = useState(false);

  const handleUserAdded = () => {
    setShowAddUserModal(false);
    onRefresh?.();
  };

  const handleCourseAssigned = () => {
    setShowAssignCourseModal(false);
    onRefresh?.();
  };

  const handleCourseUnassigned = () => {
    setShowUnassignCourseModal(false);
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
                  onClick={() => setShowAddUserModal(true)}
                >
                  <span>
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Add New User
                  </span>
                  <i className="bi bi-chevron-right"></i>
                </button>

                <button
                  className="btn btn-lg btn-outline-primary d-flex align-items-center justify-content-between"
                  onClick={() => setShowAssignCourseModal(true)}
                >
                  <span>
                    <i className="bi bi-book-fill me-2"></i>
                    Assign User to Course
                  </span>
                  <i className="bi bi-chevron-right"></i>
                </button>

                <button
                  className="btn btn-lg btn-outline-danger d-flex align-items-center justify-content-between"
                  onClick={() => setShowUnassignCourseModal(true)}
                >
                  <span>
                    <i className="bi bi-x-circle-fill me-2"></i>
                    Unassign User from Course
                  </span>
                  <i className="bi bi-chevron-right"></i>
                </button>

                <div className="border-top pt-3 mt-2">
                  <p className="text-muted small mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Use these tools to manage users and course assignments.
                  </p>
                </div>
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

      <AddUserModal
        show={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />
      <AssignCourseModal
        show={showAssignCourseModal}
        onClose={() => setShowAssignCourseModal(false)}
        onAssigned={handleCourseAssigned}
      />
      <UnassignCourseModal
        show={showUnassignCourseModal}
        onClose={() => setShowUnassignCourseModal(false)}
        onUnassigned={handleCourseUnassigned}
      />
    </>
  );
}
