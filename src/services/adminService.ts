// Admin service for user and course management operations

import axiosInstance from "./axiosInstance";
import type {
  User,
  ApiResponse,
  CreateUserData,
  UpdateUserData,
  UserCourseAssignment,
} from "../types";

export const adminService = {
  // Get all users in the system
  async getAllUsers(): Promise<User[]> {
    const response =
      await axiosInstance.get<ApiResponse<User[]>>("/users/users.php");
    return response.data.data || [];
  },

  // Create new user account
  async createUser(userData: CreateUserData) {
    const response = await axiosInstance.post("/users/users.php", userData);
    return response.data;
  },

  // Update existing user information
  async updateUser(userData: UpdateUserData) {
    const response = await axiosInstance.put("/users/users.php", userData);
    return response.data;
  },

  // Delete user by ID
  async deleteUser(userId: number) {
    const response = await axiosInstance.delete("/users/users.php", {
      data: { id: userId },
    });
    return response.data;
  },

  // Get all user-course assignments
  async getAllUserCourses(): Promise<UserCourseAssignment[]> {
    const response =
      await axiosInstance.get<ApiResponse<UserCourseAssignment[]>>(
        "/user-courses.php",
      );
    return response.data.data || [];
  },

  // Assign user to a course
  async assignUserToCourse(userId: number, courseId: number) {
    const response = await axiosInstance.post("/user-courses.php", {
      user_id: userId,
      course_id: courseId,
    });
    return response.data;
  },

  // Remove user from a course
  async removeUserFromCourse(userId: number, courseId: number) {
    const response = await axiosInstance.delete("/user-courses.php", {
      data: {
        user_id: userId,
        course_id: courseId,
      },
    });
    return response.data;
  },
};
