import { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { courseService } from "../../../services/courseService";
import type { User, Course, ApiError } from "../../../types";

interface AssignCourseModalProps {
  show: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignCourseModal({
  show,
  onClose,
  onAssigned,
}: AssignCourseModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    selectedUserId: "",
    selectedCourseId: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (show) {
      loadData();
    }
  }, [show]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [usersData, coursesData] = await Promise.all([
        adminService.getAllUsers(),
        courseService.getCourses(),
      ]);
      setUsers(usersData);
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to load users and courses");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.selectedUserId || !formData.selectedCourseId) {
      setError("Please select both a user and a course");
      return;
    }

    setLoading(true);

    try {
      const response = await adminService.assignUserToCourse(
        parseInt(formData.selectedUserId),
        parseInt(formData.selectedCourseId),
      );
      if (response.success) {
        setSuccess("User assigned to course successfully!");
        setTimeout(() => {
          onAssigned();
          handleClose();
        }, 1500);
      } else {
        setError(response.error || "Failed to assign user to course");
      }
    } catch (err) {
      const error = err as ApiError;
      setError(
        error.response?.data?.error || "Failed to assign user to course",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      selectedUserId: "",
      selectedCourseId: "",
    });
    setError("");
    setSuccess("");
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Assign User to Course</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              {loadingData ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label htmlFor="selectUser" className="form-label">
                      Select User
                    </label>
                    <select
                      className="form-select"
                      id="selectUser"
                      value={formData.selectedUserId}
                      onChange={(e) =>
                        handleChange("selectedUserId", e.target.value)
                      }
                      required
                      disabled={loading}
                    >
                      <option value="">Choose a user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email}) -{" "}
                          {user.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="selectCourse" className="form-label">
                      Select Course
                    </label>
                    <select
                      className="form-select"
                      id="selectCourse"
                      value={formData.selectedCourseId}
                      onChange={(e) =>
                        handleChange("selectedCourseId", e.target.value)
                      }
                      required
                      disabled={loading}
                    >
                      <option value="">Choose a course...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} - {course.instructor} (
                          {course.enrolled}/{course.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || loadingData}
              >
                {loading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
