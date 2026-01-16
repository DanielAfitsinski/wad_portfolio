import axiosInstance from "./axiosInstance";
import type { Course, EnrolledCourse, ApiResponse } from "../types";

export const courseService = {
  async getAvailableCourses(): Promise<Course[]> {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(
      "/courses.php"
    );
    return response.data.data || [];
  },

  async getEnrolledCourses(userId: number): Promise<EnrolledCourse[]> {
    const response = await axiosInstance.get<ApiResponse<EnrolledCourse[]>>(
      `/enrollments.php?user_id=${userId}`
    );
    return response.data.data || [];
  },

  async enrollInCourse(userId: number, courseId: number) {
    const response = await axiosInstance.post("/enroll.php", {
      user_id: userId,
      course_id: courseId,
    });
    return response.data;
  },

  async removeEnrollment(enrollmentId: number) {
    const response = await axiosInstance.post("/unenroll.php", {
      enrollment_id: enrollmentId,
    });
    return response.data;
  },

  async removeEnrollmentByUserAndCourse(userId: number, courseId: number) {
    const response = await axiosInstance.post("/unenroll.php", {
      user_id: userId,
      coruse_id: courseId,
    });
    return response.data;
  },
};
