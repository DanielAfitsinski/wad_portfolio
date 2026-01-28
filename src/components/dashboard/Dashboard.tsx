import { useState, useEffect } from "react";
import type { User, Course, EnrolledCourse } from "../../types";
import { authService } from "../../services/authService";
import { courseService } from "../../services/courseService";
import { EnrolledCoursesSection } from "./courses/EnrolledCoursesSection";
import { AvailableCoursesSection } from "./courses/AvailableCoursesSection";
import { EditCourseModal } from "./admin/EditCourseModal";
import { Navbar } from "./Navbar";

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.verifyAuth();
        setUser(userData);

        const availableCourses = await courseService.getAvailableCourses();
        setCourses(availableCourses);

        const enrolled = await courseService.getEnrolledCourses(userData.id);
        setEnrolledCourses(enrolled);
      } catch (error) {
        console.error("Auth check failed: ", error);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleEnroll = async (courseId: number) => {
    if (!user) return;
    try {
      await courseService.enrollInCourse(user.id, courseId);

      const [updatedCourses, updatedEnrolled] = await Promise.all([
        courseService.getAvailableCourses(),
        courseService.getEnrolledCourses(user.id),
      ]);

      setCourses(updatedCourses);
      setEnrolledCourses(updatedEnrolled);

      alert("Successfully enrolled! Check your email for confirmation.");
    } catch (error: any) {
      console.error("Enrollment failed: ", error);
    }
  };

  const handleUnenroll = async (enrollmentId: number) => {
    try {
      await courseService.removeEnrollment(enrollmentId);

      const available = await courseService.getAvailableCourses();
      setCourses(available);
      if (user) {
        const enrolled = await courseService.getEnrolledCourses(user.id);
        setEnrolledCourses(enrolled);
      }
    } catch (error: any) {
      console.error(
        "Unenrollment failed: ",
        error.response?.data?.error || error.message,
      );
    }
  };

  const refreshData = async () => {
    if (!user) return;
    try {
      const [updatedCourses, updatedEnrolled] = await Promise.all([
        courseService.getAvailableCourses(),
        courseService.getEnrolledCourses(user.id),
      ]);
      setCourses(updatedCourses);
      setEnrolledCourses(updatedEnrolled);
    } catch (error) {
      console.error("Failed to refresh data: ", error);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
  };

  const handleCloseEditModal = () => {
    setEditingCourse(null);
  };

  const handleCourseUpdated = async () => {
    await refreshData();
    setEditingCourse(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error: ", error);
    }
    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id));

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} onRefresh={refreshData} />

      <EnrolledCoursesSection
        courses={enrolledCourses}
        onUnenroll={handleUnenroll}
      />

      <AvailableCoursesSection
        courses={courses}
        enrolledCourseIds={enrolledCourseIds}
        isAdmin={user.role === "admin"}
        onEnroll={handleEnroll}
        onEdit={handleEditCourse}
      />

      <EditCourseModal
        show={!!editingCourse}
        course={editingCourse}
        onClose={handleCloseEditModal}
        onUpdate={handleCourseUpdated}
      />
    </div>
  );
}
