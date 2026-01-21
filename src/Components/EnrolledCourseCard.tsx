import type { EnrolledCourse } from "../types";

interface EnrolledCourseCardProps {
  course: EnrolledCourse;
  onUnenroll: (enrollmentId: number) => void;
}

export function EnrolledCourseCard({
  course,
  onUnenroll,
}: EnrolledCourseCardProps) {
  return (
    <div className="col-md-6">
      <div className="card shadow-sm border-0 h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-primary mb-2">{course.title}</h5>
          <p className="mb-1 small">
            <strong>Instructor:</strong> {course.instructor}
          </p>
          <p className="mb-1 small">
            <strong>Duration:</strong> {course.duration}
          </p>
          <p className="mb-2 small text-muted">
            Enrolled on: {new Date(course.enrollmentDate).toLocaleDateString()}
          </p>
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <span className="badge bg-info">
              {course.enrolled} of {course.capacity} spaces
            </span>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onUnenroll(course.enrollmentId)}
            >
              Remove Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
