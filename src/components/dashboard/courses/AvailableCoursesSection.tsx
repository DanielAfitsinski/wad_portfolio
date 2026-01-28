import type { Course } from "../../../types";
import { CourseCard } from "./CourseCard";

interface AvailableCoursesSectionProps {
  courses: Course[];
  enrolledCourseIds: Set<number>;
  isAdmin?: boolean;
  onEnroll: (courseId: number) => void;
  onEdit?: (course: Course) => void;
}

export function AvailableCoursesSection({
  courses,
  enrolledCourseIds,
  isAdmin = false,
  onEnroll,
  onEdit,
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
              isAdmin={isAdmin}
              onEnroll={onEnroll}
              onEdit={onEdit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
