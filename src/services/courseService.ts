// Course service for managing courses and enrollments

import axiosInstance from "./axiosInstance";
import type {
  Course,
  EnrolledCourse,
  ApiResponse,
  UpdateCourseData,
  CreateCourseData,
} from "../types";

export const courseService = {
  // Get all courses
  async getCourses(): Promise<Course[]> {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(
      "/courses/courses.php",
    );
    return response.data.data || [];
  },

  // Get available courses for enrollment
  async getAvailableCourses(): Promise<Course[]> {
    const response = await axiosInstance.get<ApiResponse<Course[]>>(
      "/courses/courses.php",
    );
    return response.data.data || [];
  },

  // Get courses a specific user is enrolled in
  async getEnrolledCourses(userId: number): Promise<EnrolledCourse[]> {
    const response = await axiosInstance.get<ApiResponse<EnrolledCourse[]>>(
      `/courses/enrollments.php?user_id=${userId}`,
    );
    return response.data.data || [];
  },

  // Update existing course information
  async updateCourse(courseId: number, courseData: UpdateCourseData) {
    const response = await axiosInstance.put("/courses/courses.php", {
      id: courseId,
      ...courseData,
    });
    return response.data;
  },

  // Create new course
  async createCourse(courseData: CreateCourseData) {
    const response = await axiosInstance.post(
      "/courses/courses.php",
      courseData,
    );
    return response.data;
  },

  // Delete course by ID
  async deleteCourse(courseId: number) {
    const response = await axiosInstance.delete("/courses/courses.php", {
      data: { id: courseId },
    });
    return response.data;
  },

  // Enroll user in a course
  async enrollInCourse(userId: number, courseId: number) {
    const response = await axiosInstance.post("/courses/enroll.php", {
      user_id: userId,
      course_id: courseId,
    });
    return response.data;
  },

  // Remove user enrollment from a course
  async removeEnrollment(enrollmentId: number) {
    const response = await axiosInstance.post("/courses/unenroll.php", {
      enrollment_id: enrollmentId,
    });
    return response.data;
  },
};
