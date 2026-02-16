// Modal component for managing users - view, edit, and delete

import { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import type { User, UpdateUserData, ApiError } from "../../../types";
import { AddUserModal } from "./AddUserModal";

interface ManageUsersModalProps {
  show: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ManageUsersModal({
  show,
  onClose,
  onRefresh,
}: ManageUsersModalProps) {
  // State management for users list and editing
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateUserData>({
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    role: "user",
    is_active: true,
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load users when modal opens
  useEffect(() => {
    if (show) {
      loadUsers();
    }
  }, [show]);

  // Fetch all users from API
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Set user data for editing
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      job_title: user.job_title || "",
      role: user.role as "user" | "admin",
      is_active: user.is_active,
    });
  };

  // Submit user edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await adminService.updateUser(editFormData);
      setEditingUser(null);
      loadUsers();
      onRefresh?.();
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.error || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // Delete user with confirmation
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setError("");
    try {
      await adminService.deleteUser(userId);
      loadUsers();
      onRefresh?.();
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.error || "Failed to delete user");
    }
  };

  // Handle user addition completion
  const handleUserAdded = () => {
    setShowAddUserModal(false);
    loadUsers();
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
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{
                background: "linear-gradient(135deg, #2d5a8c 0%, #1e3a5f 100%)",
              }}
            >
              <h5 className="modal-title text-white">
                <i className="bi bi-people-fill me-2"></i>
                Manage Users
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Job Title</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            {editingUser?.id === user.id ? (
                              <>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={editFormData.first_name || ""}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        first_name: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={editFormData.last_name || ""}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        last_name: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    value={editFormData.email}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        email: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={editFormData.job_title}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        job_title: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-select form-select-sm"
                                    value={editFormData.role}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        role: e.target.value as
                                          | "user"
                                          | "admin",
                                      })
                                    }
                                    style={{ minWidth: "100px" }}
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                                <td>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={editFormData.is_active}
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          is_active: e.target.checked,
                                        })
                                      }
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-sm btn-outline-success px-3"
                                      onClick={handleEditSubmit}
                                      disabled={saving}
                                      style={{
                                        minWidth: "80px",
                                        fontWeight: "500",
                                        transition: "all 0.2s ease",
                                      }}
                                    >
                                      {saving ? (
                                        <>
                                          <span
                                            className="spinner-border spinner-border-sm me-1"
                                            role="status"
                                            aria-hidden="true"
                                          ></span>
                                          Saving...
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-check-circle-fill me-1"></i>
                                          Save
                                        </>
                                      )}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-secondary px-3"
                                      onClick={() => setEditingUser(null)}
                                      disabled={saving}
                                      style={{
                                        minWidth: "80px",
                                        fontWeight: "500",
                                        transition: "all 0.2s ease",
                                      }}
                                    >
                                      <i className="bi bi-x-circle me-1"></i>
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.email}</td>
                                <td>{user.job_title || "-"}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      user.role === "admin"
                                        ? "primary"
                                        : "secondary"
                                    }`}
                                  >
                                    {user.role}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      user.is_active ? "success" : "danger"
                                    }`}
                                  >
                                    {user.is_active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    <i className="bi bi-pencil-fill me-1"></i>
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <i className="bi bi-trash-fill me-1"></i>
                                    Delete
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 border-top pt-3">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => setShowAddUserModal(true)}
                    >
                      <i className="bi bi-person-plus-fill me-2"></i>
                      Add New User
                    </button>
                  </div>
                </>
              )}
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
    </>
  );
}
