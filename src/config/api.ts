const API_BASE_URL = "http://localhost:8000/backend/api";

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/login.php`,
    register: `${API_BASE_URL}/register.php`,
    logout: `${API_BASE_URL}/logout.php`,
    verifyAuth: `${API_BASE_URL}/verify-auth.php`,
    forgotPassword: `${API_BASE_URL}/forgot-password.php`,
    resetPassword: `${API_BASE_URL}/reset-password.php`,
    googleLogin: `${API_BASE_URL}/google-login.php`,
  },

  // Courses
  courses: {
    list: `${API_BASE_URL}/courses.php`,
  },

  // Enrollments
  enrollments: {
    enroll: `${API_BASE_URL}/enroll.php`,
    list: `${API_BASE_URL}/enrollments.php`,
    unenroll: `${API_BASE_URL}/unenroll.php`,
  },
} as const;

export { API_BASE_URL };
