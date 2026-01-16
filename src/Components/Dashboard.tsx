import { useState, useEffect } from "react";
import type { User, Course, EnrolledCourse } from "../types";
import { authService } from "../services/authService";
import { courseService } from "../services/courseService";

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

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
        error.response?.data?.error || error.message
      );
    }
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
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id));

  return (
    <div className="bg-light min-vh-100">
      <div style={{ backgroundColor: "#2c3e50", height: "60px" }}></div>

      <div className="container-fluid py-5">
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Welcome, {user.name}!</h1>
              <p className="text-muted mb-0">
                Explore courses and manage your bookings
              </p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-12">
            <h2 className="h4 fw-bold text-dark mb-3">Your Enrolled Courses</h2>
            {enrolledCourses.length ? (
              <div className="row g-3">
                {enrolledCourses.map((course) => (
                  <div key={course.enrollmentId} className="col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-primary mb-2">
                          {course.title}
                        </h5>
                        <p className="mb-1 small">
                          <strong>Instructor:</strong> {course.instructor}
                        </p>
                        <p className="mb-1 small">
                          <strong>Duration:</strong> {course.duration}
                        </p>
                        <p className="mb-2 small text-muted">
                          Enrolled on:{" "}
                          {new Date(course.enrollmentDate).toLocaleDateString()}
                        </p>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <span className="badge bg-info">
                            {course.enrolled} of {course.capacity} spaces
                          </span>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleUnenroll(course.enrollmentId)}
                          >
                            Remove Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                You’re not enrolled in any courses yet.
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h2 className="h4 fw-bold text-dark mb-3">Available Courses</h2>
            <div className="row g-4">
              {courses.map((course) => {
                const isFull = course.enrolled >= course.capacity;
                const isEnrolled = enrolledCourseIds.has(course.id);
                const percent = Math.round(
                  (course.enrolled / course.capacity) * 100
                );

                return (
                  <div key={course.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-primary">
                          {course.title}
                        </h5>
                        <p className="card-text text-muted small flex-grow-1">
                          {course.description}
                        </p>

                        <div className="mb-3">
                          <p className="mb-1 small">
                            <strong>Instructor:</strong> {course.instructor}
                          </p>
                          <p className="mb-0 small">
                            <strong>Duration:</strong> {course.duration}
                          </p>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small fw-bold">Enrollment</span>
                            <span
                              className={`badge ${
                                isFull ? "bg-danger" : "bg-info"
                              }`}
                            >
                              {course.enrolled} of {course.capacity} spaces
                            </span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar ${
                                isFull ? "bg-danger" : "bg-success"
                              }`}
                              role="progressbar"
                              style={{ width: `${percent}%` }}
                              aria-valuenow={course.enrolled}
                              aria-valuemin={0}
                              aria-valuemax={course.capacity}
                            />
                          </div>
                          <p className="mt-2 mb-0 small text-muted">
                            {isFull ? (
                              <span className="text-danger fw-bold">
                                Course is Full
                              </span>
                            ) : (
                              <span>
                                {course.capacity - course.enrolled} spot(s)
                                available
                              </span>
                            )}
                          </p>
                        </div>

                        <button
                          className={`btn w-100 ${
                            isFull || isEnrolled
                              ? "btn-secondary"
                              : "btn-primary"
                          }`}
                          disabled={isFull || isEnrolled}
                          onClick={() => handleEnroll(course.id)}
                        >
                          {isEnrolled
                            ? "Enrolled"
                            : isFull
                            ? "Course Full"
                            : "Enroll"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
