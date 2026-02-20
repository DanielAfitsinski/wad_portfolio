// Authentication service for user login, registration, and session management

import axiosInstance from "./axiosInstance";
import type { User, ApiResponse } from "../types";

export const authService = {
  // Verify user authentication status
  async verifyAuth(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      "/login/verify-auth.php",
    );
    return response.data.user!;
  },

  // Authenticate user with email and password
  async login(email: string, password: string) {
    const response = await axiosInstance.post("/login/login.php", {
      email,
      password,
    });
    return response.data;
  },

  // Authenticate user with Google OAuth token
  async googleLogin(accessToken: string) {
    const response = await axiosInstance.post("/login/google-login.php", {
      token: accessToken,
    });
    return response.data;
  },

  // End user session
  async logout() {
    const response = await axiosInstance.post("/login/logout.php", {});
    return response.data;
  },

  // Request password reset email
  async forgotPassword(email: string) {
    const response = await axiosInstance.post("/login/forgot-password.php", {
      email,
    });
    return response.data;
  },

  // Reset password with token
  async resetPassword(token: string, password: string) {
    const response = await axiosInstance.post("/login/reset-password.php", {
      token,
      password,
    });
    return response.data;
  },
};
