// Application type definitions and interfaces

// User type for authentication and user management
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  role: "user" | "admin";
  is_active?: boolean;
}

// Course type for course listings
export interface Course {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  instructor: string;
  start_date: string;
  end_date: string;
  enrolled: number;
  capacity: number;
}

// Course enrollment relationship
export interface CourseEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
}

// Extended course type with enrollment details
export interface EnrolledCourse extends Course {
  enrollmentDate: string;
  enrollmentId: number;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
  user?: T;
}

// User management types
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

// User-course assignment type
export interface UserCourseAssignment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  user_name?: string;
  user_email?: string;
  course_title?: string;
}

// Course management types
export interface UpdateCourseData {
  title?: string;
  description?: string;
  full_description?: string;
  instructor?: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  full_description?: string;
  instructor: string;
  start_date: string;
  end_date: string;
  capacity: number;
}

// Error handling types
export interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
      lockedUntil?: number;
    };
  };
  message?: string;
}

export interface GoogleOAuthError {
  error?: string;
  error_description?: string;
}
