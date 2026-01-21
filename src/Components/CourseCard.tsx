import { useState } from "react";
import type { Course } from "../types";

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: number) => void;
}

export function CourseCard({ course, isEnrolled, onEnroll }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFull = course.enrolled >= course.capacity;
  const percent = Math.round((course.enrolled / course.capacity) * 100);

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-primary">{course.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {isExpanded && course.full_description
              ? course.full_description
              : course.description}
          </p>

          <div className="mb-3">
            <p className="mb-1 small">
              <strong>Instructor:</strong> {course.instructor}
            </p>
            <p className="mb-0 small">
              <strong>Duration:</strong> {course.duration}
            </p>
          </div>

          {course.full_description && (
            <button
              className="btn btn-link btn-sm p-0 mb-3 text-decoration-none"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show Less ▲" : "View Full Course Details ▼"}
            </button>
          )}

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small fw-bold">Enrollment</span>
              <span className={`badge ${isFull ? "bg-danger" : "bg-info"}`}>
                {course.enrolled} of {course.capacity} spaces
              </span>
            </div>
            <div className="progress" style={{ height: "6px" }}>
              <div
                className={`progress-bar ${isFull ? "bg-danger" : "bg-success"}`}
                role="progressbar"
                style={{ width: `${percent}%` }}
                aria-valuenow={course.enrolled}
                aria-valuemin={0}
                aria-valuemax={course.capacity}
              />
            </div>
            <p className="mt-2 mb-0 small text-muted">
              {isFull ? (
                <span className="text-danger fw-bold">Course is Full</span>
              ) : (
                <span>
                  {course.capacity - course.enrolled} spot(s) available
                </span>
              )}
            </p>
          </div>

          <button
            className={`btn w-100 ${
              isFull || isEnrolled ? "btn-secondary" : "btn-primary"
            }`}
            disabled={isFull || isEnrolled}
            onClick={() => onEnroll(course.id)}
          >
            {isEnrolled ? "Enrolled" : isFull ? "Course Full" : "Enroll"}
          </button>
        </div>
      </div>
    </div>
  );
}
