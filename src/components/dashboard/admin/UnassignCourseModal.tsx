import { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import type { UserCourseAssignment } from "../services/adminService";

interface UnassignCourseModalProps {
  show: boolean;
  onClose: () => void;
  onUnassigned: () => void;
}

interface UserWithCourses {
  user_id: number;
  user_name: string;
  user_email: string;
  courses: UserCourseAssignment[];
}

export function UnassignCourseModal({
  show,
  onClose,
  onUnassigned,
}: UnassignCourseModalProps) {
  const [assignments, setAssignments] = useState<UserCourseAssignment[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (show) {
      loadAssignments();
    }
  }, [show]);

  const loadAssignments = async () => {
    setLoadingData(true);
    try {
      const data = await adminService.getAllUserCourses();
      setAssignments(data);
    } catch (err) {
      setError("Failed to load course assignments");
    } finally {
      setLoadingData(false);
    }
  };

  const usersWithCourses: UserWithCourses[] = Array.from(
    assignments
      .reduce((map, assignment) => {
        const userId = assignment.user_id;
        if (!map.has(userId)) {
          map.set(userId, {
            user_id: userId,
            user_name: assignment.user_name || "",
            user_email: assignment.user_email || "",
            courses: [],
          });
        }
        map.get(userId)!.courses.push(assignment);
        return map;
      }, new Map<number, UserWithCourses>())
      .values(),
  );

  const selectedUser = usersWithCourses.find(
    (u) => u.user_id.toString() === selectedUserId,
  );

  const toggleCourse = (courseId: number) => {
    const newSelected = new Set(selectedCourseIds);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourseIds(newSelected);
  };

  const toggleAll = () => {
    if (!selectedUser) return;

    if (selectedCourseIds.size === selectedUser.courses.length) {
      setSelectedCourseIds(new Set());
    } else {
      setSelectedCourseIds(
        new Set(selectedUser.courses.map((c) => c.course_id)),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    if (selectedCourseIds.size === 0) {
      setError("Please select at least one course to unassign");
      return;
    }

    setLoading(true);

    try {
      const userId = parseInt(selectedUserId);
      const promises = Array.from(selectedCourseIds).map((courseId) =>
        adminService.removeUserFromCourse(userId, courseId),
      );

      await Promise.all(promises);

      setSuccess(
        `Successfully unassigned ${selectedCourseIds.size} course(s)!`,
      );
      setTimeout(() => {
        onUnassigned();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to unassign courses");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    setSelectedCourseIds(new Set());
    setError("");
    setSuccess("");
    onClose();
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedCourseIds(new Set());
    setError("");
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Manage User Course Assignments</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            {loadingData ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="user" className="form-label fw-bold">
                    Step 1: Select User <span className="text-danger">*</span>
                  </label>
                  <select
                    id="user"
                    className="form-select form-select-lg"
                    value={selectedUserId}
                    onChange={(e) => handleUserChange(e.target.value)}
                    required
                  >
                    <option value="">-- Select a user --</option>
                    {usersWithCourses.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.user_name} ({user.user_email}) -{" "}
                        {user.courses.length} course(s)
                      </option>
                    ))}
                  </select>
                  {usersWithCourses.length === 0 && (
                    <div className="text-muted small mt-2">
                      No course assignments found
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-bold mb-0">
                        Step 2: Select Courses to Unassign{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={toggleAll}
                      >
                        {selectedCourseIds.size === selectedUser.courses.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    </div>
                    <div
                      className="border rounded p-3"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      {selectedUser.courses.map((course) => (
                        <div
                          key={course.id}
                          className="form-check mb-2 p-2 rounded hover-bg-light"
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleCourse(course.course_id)}
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedCourseIds.has(course.course_id)}
                            onChange={() => toggleCourse(course.course_id)}
                            id={`course-${course.id}`}
                            style={{ cursor: "pointer" }}
                          />
                          <label
                            className="form-check-label w-100"
                            htmlFor={`course-${course.id}`}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong>{course.course_title}</strong>
                                <div className="text-muted small">
                                  Enrolled:{" "}
                                  {new Date(
                                    course.enrolled_at,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="text-muted small mt-2">
                      {selectedCourseIds.size} of {selectedUser.courses.length}{" "}
                      course(s) selected
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={
                      loading || !selectedUserId || selectedCourseIds.size === 0
                    }
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Removing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-x-circle me-2"></i>
                        Unassign{" "}
                        {selectedCourseIds.size > 0
                          ? `(${selectedCourseIds.size})`
                          : ""}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
