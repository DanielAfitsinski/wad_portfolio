import { useState, useEffect } from "react";
import type {
  Course,
  User,
  UserCourseAssignment,
  ApiError,
} from "../../../types";
import { adminService } from "../../../services/adminService";
import { courseService } from "../../../services/courseService";

interface EditCourseModalProps {
  show: boolean;
  course: Course | null;
  onClose: () => void;
  onUpdate?: () => void;
}

type TabType = "details" | "assignments" | "assign";

export function EditCourseModal({
  show,
  course,
  onClose,
  onUpdate,
}: EditCourseModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<UserCourseAssignment[]>(
    [],
  );

  // Course form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    full_description: "",
    instructor: "",
    duration: "",
    capacity: 0,
  });

  // Assignment form
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        full_description: course.full_description || "",
        instructor: course.instructor,
        duration: course.duration,
        capacity: course.capacity,
      });
    }
  }, [course]);

  useEffect(() => {
    if (show && course) {
      loadData();
    }
  }, [show, course]);

  const loadData = async () => {
    if (!course) return;

    try {
      const [users, assignments] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllUserCourses(),
      ]);

      setAllUsers(users);

      // Filter for this course
      const courseAssignments = assignments.filter(
        (a) => a.course_id === course.id,
      );

      // Add user details
      const enrichedAssignments = courseAssignments.map((assignment) => {
        const user = users.find((u) => u.id === assignment.user_id);
        return {
          ...assignment,
          user_name: user ? `${user.first_name} ${user.last_name}` : undefined,
          user_email: user?.email,
        };
      });

      setEnrolledUsers(enrichedAssignments);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setLoading(true);
    try {
      await courseService.updateCourse(course.id, formData);

      alert("Course updated successfully!");
      onUpdate?.();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      console.error("Failed to update course:", error);
      alert(error.response?.data?.error || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !selectedUserId) return;

    setLoading(true);
    try {
      await adminService.assignUserToCourse(
        parseInt(selectedUserId),
        course.id,
      );

      alert("User assigned successfully!");
      setSelectedUserId("");
      await loadData();
      onUpdate?.();
    } catch (err) {
      const error = err as ApiError;
      console.error("Failed to assign user:", error);
      alert(error.response?.data?.error || "Failed to assign user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignUser = async (userId: number) => {
    if (!course) return;

    const confirmUnassign = window.confirm(
      "Are you sure you want to unassign this user?",
    );
    if (!confirmUnassign) return;

    setLoading(true);
    try {
      await adminService.removeUserFromCourse(userId, course.id);

      alert("User unassigned successfully!");
      await loadData();
      onUpdate?.();
    } catch (err) {
      const error = err as ApiError;
      console.error("Failed to unassign user:", error);
      alert(error.response?.data?.error || "Failed to unassign user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    if (course.enrolled > 0) {
      alert(
        "Cannot delete course with enrolled students. Please unassign all students first.",
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${course.title}"? This action cannot be undone.`,
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await courseService.deleteCourse(course.id);

      alert("Course deleted successfully!");
      onUpdate?.();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      console.error("Failed to delete course:", error);
      alert(error.response?.data?.error || "Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !course) return null;

  const availableUsers = allUsers.filter(
    (user) => !enrolledUsers.some((e) => e.user_id === user.id),
  );

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #2d5a8c 0%, #1e3a5f 100%)",
            }}
          >
            <h5 className="modal-title text-white">
              <i className="bi bi-pencil-square me-2"></i>
              Edit Course: {course.title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <ul className="nav nav-tabs mb-4" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                  onClick={() => setActiveTab("details")}
                  type="button"
                >
                  <i className="bi bi-info-circle me-1"></i>
                  Course Details
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "assignments" ? "active" : ""}`}
                  onClick={() => setActiveTab("assignments")}
                  type="button"
                >
                  <i className="bi bi-people me-1"></i>
                  Enrolled Users ({enrolledUsers.length})
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "assign" ? "active" : ""}`}
                  onClick={() => setActiveTab("assign")}
                  type="button"
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Assign User
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {activeTab === "details" && (
                <div className="tab-pane fade show active">
                  <form onSubmit={handleUpdateCourse}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Description</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Full Description (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.full_description}
                        onChange={(e) =>
                          handleChange("full_description", e.target.value)
                        }
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Instructor</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.instructor}
                          onChange={(e) =>
                            handleChange("instructor", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Duration</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) =>
                            handleChange("duration", e.target.value)
                          }
                          placeholder="e.g., 8 weeks"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.capacity}
                        onChange={(e) =>
                          handleChange("capacity", parseInt(e.target.value))
                        }
                        min={course.enrolled}
                        required
                      />
                      <small className="text-muted">
                        Current enrollment: {course.enrolled}. Capacity cannot
                        be less than current enrollment.
                      </small>
                    </div>

                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-save me-2"></i>
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDeleteCourse}
                        disabled={loading || course.enrolled > 0}
                        title={
                          course.enrolled > 0
                            ? "Cannot delete course with enrolled students"
                            : "Delete this course permanently"
                        }
                      >
                        <i className="bi bi-trash me-2"></i>
                        Delete Course
                      </button>
                    </div>

                    {course.enrolled > 0 && (
                      <div className="alert alert-warning mt-3 mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        This course has {course.enrolled} enrolled student
                        {course.enrolled !== 1 ? "s" : ""}. You must unassign
                        all students before deleting the course.
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="tab-pane fade show active">
                  {enrolledUsers.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      <p>No users enrolled in this course yet.</p>
                    </div>
                  ) : (
                    <div className="list-group">
                      {enrolledUsers.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1">{enrollment.user_name}</h6>
                            <small className="text-muted">
                              {enrollment.user_email}
                            </small>
                            <br />
                            <small className="text-muted">
                              Enrolled:{" "}
                              {new Date(
                                enrollment.enrolled_at,
                              ).toLocaleDateString()}
                            </small>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleUnassignUser(enrollment.user_id)
                            }
                            disabled={loading}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Unassign
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "assign" && (
                <div className="tab-pane fade show active">
                  {availableUsers.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-check-circle fs-1 d-block mb-2"></i>
                      <p>All users are already assigned to this course.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAssignUser}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Select User to Assign
                        </label>
                        <select
                          className="form-select"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          required
                        >
                          <option value="">Choose a user...</option>
                          {availableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.email})
                              - {user.role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        The user will be enrolled in this course and receive a
                        confirmation email.
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading || !selectedUserId}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Assigning...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-check me-2"></i>
                              Assign User
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setSelectedUserId("")}
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
