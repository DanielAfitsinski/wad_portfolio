import axiosInstance from "./axiosInstance";
import type { User, ApiResponse } from "../types";

export const authService = {
  // Get the current logged-in user
  async verifyAuth(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      "/verify-auth.php"
    );
    return response.data.user!;
  },
  // login with email and password
  async login(email: string, password: string) {
    const response = await axiosInstance.post("/login.php", {
      email,
      password,
    });
    return response.data;
  },

  async googleLogin(accessToken: string) {
    const response = await axiosInstance.post("/google-login.php", {
      token: accessToken,
    });
    return response.data;
  },

  // Create a new account
  async register(name: string, email: string, password: string) {
    const response = await axiosInstance.post("/register.php", {
      name,
      email,
      password,
    });
    return response.data;
  },
  // Logout the user
  async logout() {
    const response = await axiosInstance.post("/logout.php", {});
    return response.data;
  },
};
