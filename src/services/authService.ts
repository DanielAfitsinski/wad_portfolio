import axiosInstance from "./axiosInstance";
import type { User, ApiResponse } from "../types";

export const authService = {
  // Verify auth
  async verifyAuth(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      "/login/verify-auth.php",
    );
    return response.data.user!;
  },
  // Login
  async login(email: string, password: string) {
    const response = await axiosInstance.post("/login/login.php", {
      email,
      password,
    });
    return response.data;
  },

  async googleLogin(accessToken: string) {
    const response = await axiosInstance.post("/login/google-login.php", {
      token: accessToken,
    });
    return response.data;
  },

  // Register
  async register(name: string, email: string, password: string) {
    const response = await axiosInstance.post("/login/register.php", {
      name,
      email,
      password,
    });
    return response.data;
  },
  // Logout
  async logout() {
    const response = await axiosInstance.post("/login/logout.php", {});
    return response.data;
  },
};
