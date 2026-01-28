import axiosInstance from "./axiosInstance";
import type { Course, EnrolledCourse, ApiResponse } from "../types";

interface UpdateCourseData {
  title?: string;
  description?: string;
  full_description?: string;
  instructor?: string;
  duration?: string;
  capacity?: number;
}

interface CreateCourseData {
  title: string;
  description: string;
  full_description?: string;
  instructor: string;
  duration: string;
  capacity: number;
}

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(
      "/courses/courses.php",
    );
    return response.data.data || [];
  },

  async getAvailableCourses(): Promise<Course[]> {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(
      "/courses/courses.php",
    );
    return response.data.data || [];
  },

  async getEnrolledCourses(userId: number): Promise<EnrolledCourse[]> {
    const response = await axiosInstance.get<ApiResponse<EnrolledCourse[]>>(
      `/courses/enrollments.php?user_id=${userId}`,
    );
    return response.data.data || [];
  },

  async updateCourse(courseId: number, courseData: UpdateCourseData) {
    const response = await axiosInstance.put("/courses/courses.php", {
      id: courseId,
      ...courseData,
    });
    return response.data;
  },

  async createCourse(courseData: CreateCourseData) {
    const response = await axiosInstance.post(
      "/courses/courses.php",
      courseData,
    );
    return response.data;
  },

  async deleteCourse(courseId: number) {
    const response = await axiosInstance.delete("/courses/courses.php", {
      data: { id: courseId },
    });
    return response.data;
  },

  async enrollInCourse(userId: number, courseId: number) {
    const response = await axiosInstance.post("/courses/enroll.php", {
      user_id: userId,
      course_id: courseId,
    });
    return response.data;
  },

  async removeEnrollment(enrollmentId: number) {
    const response = await axiosInstance.post("/courses/unenroll.php", {
      enrollment_id: enrollmentId,
    });
    return response.data;
  },

  async removeEnrollmentByUserAndCourse(userId: number, courseId: number) {
    const response = await axiosInstance.post("/courses/unenroll.php", {
      user_id: userId,
      coruse_id: courseId,
    });
    return response.data;
  },
};
