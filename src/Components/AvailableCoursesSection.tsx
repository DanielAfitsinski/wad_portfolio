import type { Course } from "../types";
import { CourseCard } from "./CourseCard";

interface AvailableCoursesSectionProps {
  courses: Course[];
  enrolledCourseIds: Set<number>;
  onEnroll: (courseId: number) => void;
}

export function AvailableCoursesSection({
  courses,
  enrolledCourseIds,
  onEnroll,
}: AvailableCoursesSectionProps) {
  return (
    <div className="row">
      <div className="col-12">
        <h2 className="h4 fw-bold text-dark mb-3">Available Courses</h2>
        <div className="row g-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledCourseIds.has(course.id)}
              onEnroll={onEnroll}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
