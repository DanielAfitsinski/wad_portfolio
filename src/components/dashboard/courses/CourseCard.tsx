// Course card component for displaying individual course details with enroll/edit actions

import { useState } from "react";
import type { Course } from "../../../types";

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  isAdmin?: boolean;
  onEnroll: (courseId: number) => void;
  onEdit?: (course: Course) => void;
}

export function CourseCard({
  course,
  isEnrolled,
  isAdmin = false,
  onEnroll,
  onEdit,
}: CourseCardProps) {
  // State for expanding/collapsing full description
  const [isExpanded, setIsExpanded] = useState(false);
  const isFull = course.enrolled >= course.capacity;
  const percent = Math.round((course.enrolled / course.capacity) * 100);

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="col-md-6 col-lg-4 mb-3">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{course.title}</h5>
          <p className="card-text">
            {isExpanded && course.full_description
              ? course.full_description
              : course.description}
          </p>

          <div className="mb-3">
            <p className="mb-1">
              <strong>Instructor:</strong> {course.instructor}
            </p>
            <p className="mb-0">
              <strong>Duration:</strong> {formatDate(course.start_date)} -{" "}
              {formatDate(course.end_date)}
            </p>
          </div>

          {course.full_description && (
            <button
              className="btn btn-link p-0 mb-3"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          )}

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Enrollment</span>
              <span className={`badge ${isFull ? "bg-danger" : "bg-primary"}`}>
                {course.enrolled}/{course.capacity}
              </span>
            </div>
            <div className="progress">
              <div
                className={`progress-bar ${isFull ? "bg-danger" : "bg-success"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 mb-0 small">
              {isFull ? (
                <span className="text-danger">Course Full</span>
              ) : (
                <span>{course.capacity - course.enrolled} spots left</span>
              )}
            </p>
          </div>

          <div>
            <button
              className={`btn w-100 mb-2 ${
                isFull || isEnrolled ? "btn-secondary" : "btn-primary"
              }`}
              disabled={isFull || isEnrolled}
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to enroll in "${course.title}"?`,
                  )
                ) {
                  onEnroll(course.id);
                }
              }}
            >
              {isEnrolled ? "Enrolled" : isFull ? "Full" : "Enroll"}
            </button>

            {isAdmin && onEdit && (
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => onEdit(course)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
