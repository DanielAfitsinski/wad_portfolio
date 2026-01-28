import type { EnrolledCourse } from "../../../types";
import { EnrolledCourseCard } from "./EnrolledCourseCard";

interface EnrolledCoursesSectionProps {
  courses: EnrolledCourse[];
  onUnenroll: (enrollmentId: number) => void;
}

export function EnrolledCoursesSection({
  courses,
  onUnenroll,
}: EnrolledCoursesSectionProps) {
  return (
    <div className="row mb-5">
      <div className="col-12">
        <h2 className="h4 fw-bold text-dark mb-3">Your Enrolled Courses</h2>
        {courses.length ? (
          <div className="row g-3">
            {courses.map((course) => (
              <EnrolledCourseCard
                key={course.enrollmentId}
                course={course}
                onUnenroll={onUnenroll}
              />
            ))}
          </div>
        ) : (
          <div className="alert alert-info">
            You're not enrolled in any courses yet.
          </div>
        )}
      </div>
    </div>
  );
}
