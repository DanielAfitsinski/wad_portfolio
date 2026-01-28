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
    <div className="container mt-4">
      <h2>Available Courses</h2>
      <div className="row">
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
  );
}
