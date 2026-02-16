// API configuration and endpoint definitions

// Determine if running in production or development environment
const isProduction = window.location.hostname.includes(
  "ws411479-wad.remote.ac",
);

// Set base API URL based on environment
const API_BASE_URL = isProduction
  ? `${window.location.protocol}//${window.location.hostname}/backend/api`
  : "http://localhost:8000/backend/api";

// Centralized API endpoint definitions
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/login/login.php`,
    register: `${API_BASE_URL}/login/register.php`,
    logout: `${API_BASE_URL}/login/logout.php`,
    verifyAuth: `${API_BASE_URL}/login/verify-auth.php`,
    forgotPassword: `${API_BASE_URL}/login/forgot-password.php`,
    resetPassword: `${API_BASE_URL}/login/reset-password.php`,
    googleLogin: `${API_BASE_URL}/login/google-login.php`,
  },

  // Courses
  courses: {
    list: `${API_BASE_URL}/courses/courses.php`,
  },

  // Enrollments
  enrollments: {
    enroll: `${API_BASE_URL}/courses/enroll.php`,
    list: `${API_BASE_URL}/courses/enrollments.php`,
    unenroll: `${API_BASE_URL}/courses/unenroll.php`,
  },

  // Admin
  admin: {
    users: `${API_BASE_URL}/users/users.php`,
    userCourses: `${API_BASE_URL}/user-courses.php`,
  },
} as const;

export { API_BASE_URL };
