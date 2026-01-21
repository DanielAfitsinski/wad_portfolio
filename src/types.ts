export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  is_active?: boolean;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  instructor: string;
  duration: string;
  enrolled: number;
  capacity: number;
}

export interface CourseEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
}

export interface EnrolledCourse extends Course {
  enrollmentDate: string;
  enrollmentId: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
  user?: T;
}
