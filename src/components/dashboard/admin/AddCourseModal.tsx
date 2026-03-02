// Modal component for creating a new course

import { useState } from "react";
import { courseService } from "../../../services/courseService";
import type { ApiError, CreateCourseData } from "../../../types";

interface AddCourseModalProps {
  show: boolean;
  onClose: () => void;
  onCourseAdded?: () => void;
}

// Initial form values
const initialFormData: CreateCourseData = {
  title: "",
  description: "",
  full_description: "",
  instructor: "",
  start_date: "",
  end_date: "",
  capacity: 30,
};

export function AddCourseModal({
  show,
  onClose,
  onCourseAdded,
}: AddCourseModalProps) {
  // State management for form and loading
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCourseData>(initialFormData);

  // Handle form field changes
  const handleChange = (
    field: keyof CreateCourseData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await courseService.createCourse({
        ...formData,
        full_description: formData.full_description || undefined,
      });

      alert("Course created successfully!");

      // Reset form
      setFormData(initialFormData);

      onCourseAdded?.();
    } catch (err) {
      const error = err as ApiError;
      console.error("Failed to create course:", error);
      alert(error.response?.data?.error || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
        <div className="modal-content">
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #2d5a8c 0%, #1e3a5f 100%)",
            }}
          >
            <h5 className="modal-title text-white">
              <i className="bi bi-plus-circle-fill me-2"></i>
              Add New Course
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit} id="addCourseForm">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Course Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g., Introduction to Python Programming"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Short Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description shown on course card"
                  required
                />
                <small className="text-muted">
                  This appears on the course card
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Full Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={formData.full_description || ""}
                  onChange={(e) =>
                    handleChange("full_description", e.target.value)
                  }
                  placeholder="Detailed course description (shown when user expands)"
                />
                <small className="text-muted">
                  Detailed information visible when users click "View Full
                  Course Details"
                </small>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Instructor <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.instructor}
                    onChange={(e) => handleChange("instructor", e.target.value)}
                    placeholder="e.g., Dr. Jane Smith"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Capacity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleChange("capacity", parseInt(e.target.value))
                    }
                    min={1}
                    max={1000}
                    required
                  />
                  <small className="text-muted">
                    Maximum number of students that can enroll
                  </small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    min={formData.start_date}
                    required
                  />
                </div>
              </div>

              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                All fields marked with <span className="text-danger">
                  *
                </span>{" "}
                are required.
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addCourseForm"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Course
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
