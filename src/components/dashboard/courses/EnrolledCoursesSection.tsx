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
    <div className="container mt-4">
      <h2>Your Enrolled Courses</h2>
      {courses.length ? (
        <div className="row">
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
  );
}
