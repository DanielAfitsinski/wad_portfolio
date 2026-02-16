import type { EnrolledCourse } from "../../../types";

interface EnrolledCourseCardProps {
  course: EnrolledCourse;
  onUnenroll: (enrollmentId: number) => void;
}

export function EnrolledCourseCard({
  course,
  onUnenroll,
}: EnrolledCourseCardProps) {
  return (
    <div className="col-md-6 mb-3">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{course.title}</h5>
          <p className="mb-1">
            <strong>Instructor:</strong> {course.instructor}
          </p>
          <p className="mb-1">
            <strong>Duration:</strong> {course.duration}
          </p>
          <p className="mb-2 text-muted">
            Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}
          </p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-primary">
              {course.enrolled}/{course.capacity}
            </span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onUnenroll(course.enrollmentId)}
            >
              Unenroll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
