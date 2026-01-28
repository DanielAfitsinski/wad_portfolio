import axiosInstance from "./axiosInstance";
import type { User, ApiResponse } from "../types";

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  job_title: string;
  role?: "user" | "admin";
  is_active?: boolean;
}

export interface UpdateUserData {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
  role?: "user" | "admin";
  is_active?: boolean;
}

export interface UserCourseAssignment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  user_name?: string;
  user_email?: string;
  course_title?: string;
}

export const adminService = {
  // Users
  async getAllUsers(): Promise<User[]> {
    const response =
      await axiosInstance.get<ApiResponse<User[]>>("/users/users.php");
    return response.data.data || [];
  },

  async createUser(userData: CreateUserData) {
    const response = await axiosInstance.post("/users/users.php", userData);
    return response.data;
  },

  async updateUser(userData: UpdateUserData) {
    const response = await axiosInstance.put("/users/users.php", userData);
    return response.data;
  },

  async deleteUser(userId: number) {
    const response = await axiosInstance.delete("/users/users.php", {
      data: { id: userId },
    });
    return response.data;
  },

  // User courses
  async getAllUserCourses(): Promise<UserCourseAssignment[]> {
    const response =
      await axiosInstance.get<ApiResponse<UserCourseAssignment[]>>(
        "/user-courses.php",
      );
    return response.data.data || [];
  },

  async getUserCourses(userId: number) {
    const response = await axiosInstance.get(
      `/user-courses.php?user_id=${userId}`,
    );
    return response.data;
  },

  async assignUserToCourse(userId: number, courseId: number) {
    const response = await axiosInstance.post("/user-courses.php", {
      user_id: userId,
      course_id: courseId,
    });
    return response.data;
  },

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
