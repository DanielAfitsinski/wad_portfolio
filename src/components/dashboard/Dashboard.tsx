// Main dashboard component for course management and enrollment

import { useState, useEffect } from "react";
import type { User, Course, EnrolledCourse, ApiError } from "../../types";
import { authService } from "../../services/authService";
import { courseService } from "../../services/courseService";
import { EnrolledCoursesSection } from "./courses/EnrolledCoursesSection";
import { AvailableCoursesSection } from "./courses/AvailableCoursesSection";
import { EditCourseModal } from "./admin/EditCourseModal";
import { Navbar } from "./Navbar";

export function Dashboard() {
  // State management for user and courses
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Load user data and courses on component mount
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

  // Handle course enrollment
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
    } catch (err) {
      const error = err as ApiError;
      console.error("Enrollment failed: ", error);
    }
  };

  // Handle course unenrollment
  const handleUnenroll = async (enrollmentId: number) => {
    try {
      await courseService.removeEnrollment(enrollmentId);

      const available = await courseService.getAvailableCourses();
      setCourses(available);
      if (user) {
        const enrolled = await courseService.getEnrolledCourses(user.id);
        setEnrolledCourses(enrolled);
      }
    } catch (err) {
      const error = err as ApiError;
      console.error(
        "Unenrollment failed: ",
        error.response?.data?.error || error.message,
      );
    }
  };

  // Refresh all course data
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

  // Open course edit modal
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
  };

  // Close course edit modal
  const handleCloseEditModal = () => {
    setEditingCourse(null);
  };

  // Handle successful course update
  const handleCourseUpdated = async () => {
    await refreshData();
    setEditingCourse(null);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error: ", error);
    }
    window.location.href = "/";
  };

  // Show loading spinner while fetching data
  if (loading || !user) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Create set of enrolled course IDs for quick lookup
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
