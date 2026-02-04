# TechCourses4U - Technical Annotations & Implementation Notes

**Project:** Learning Management System (LMS)  
**Created:** January 2026  
**Purpose:** Assignment Task 1 - Technical Design Documentation

---

## Table of Contents

1. [Technology Stack Overview](#1-technology-stack-overview)
2. [Authentication & Security Architecture](#2-authentication--security-architecture)
3. [API Endpoints Reference](#3-api-endpoints-reference)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Email System](#6-email-system)
7. [Security Features](#7-security-features)
8. [Performance Optimization](#8-performance-optimization)

---

## 1. Technology Stack Overview

### 1.1 Frontend Stack

**Core Framework:**

```
React 19.2.0 (Latest)
├── Component-based architecture
├── Hooks for state management
├── Context API for global state
└── Functional components throughout
```

**Language:**

```
TypeScript 5.9.3
├── Strong typing for props and state
├── Interface definitions for API responses
├── Type-safe routing
└── Enhanced IDE support and error catching
```

**Build Tool:**

```
Vite (with Rolldown)
├── Fast hot module replacement (HMR)
├── Optimized production builds
├── ES modules support
└── Development server with instant feedback
```

**Routing:**

```
React Router DOM 7.10.1
├── Client-side routing
├── Protected routes with authentication checks
├── Programmatic navigation
└── URL parameter handling (e.g., ?token=...)
```

**HTTP Client:**

```
Axios 1.13.2
├── Promise-based requests
├── Interceptors for auth token injection
├── Request/response transformations
├── Error handling middleware
└── Configured base URL
```

**UI Framework:**

```
Bootstrap 5.3.0
├── Responsive grid system
├── Pre-built components (modals, alerts, buttons)
├── Utility classes for spacing/layout
└── Custom CSS for branding
```

**OAuth Integration:**

```
@react-oauth/google 0.12.2
├── Google Sign-In integration
├── Popup-based authentication flow
├── Token exchange with backend
└── User profile fetching
```

**Development Tools:**

```
ESLint 9.39.1
├── Code quality enforcement
├── TypeScript-specific rules
└── React best practices

TypeScript ESLint 8.46.4
├── TS syntax linting
└── Type checking

React Compiler (Babel Plugin)
├── Automatic optimization
└── Performance improvements
```

---

### 1.2 Backend Stack

**Server-Side Language:**

```
PHP 8.0+
├── Object-oriented programming
├── Namespace support
├── Type declarations
└── Modern syntax (arrow functions, null coalescing)
```

**Database:**

```
MySQL 8.0+
├── InnoDB storage engine
├── ACID compliance
├── Foreign key constraints
├── Full-text search capabilities
└── utf8mb4 character set (full Unicode)
```

**Database Abstraction:**

```
PDO (PHP Data Objects)
├── Prepared statements (SQL injection prevention)
├── Named parameters (:param)
├── Exception-based error handling
├── Multiple database support
└── Transaction management
```

**Email Service:**

```
PHPMailer 6.8
├── SMTP protocol support
├── HTML and plain-text emails
├── Attachment support
├── TLS/SSL encryption
└── Multiple recipient handling
```

**Architecture Pattern:**

```
Model-View-Controller (MVC)
├── Models: Implicit in database queries
├── Views: React frontend (decoupled)
├── Controllers: PHP classes handling business logic
│   ├── AuthController.php
│   ├── UserController.php
│   ├── CourseController.php
│   └── EnrollmentController.php
```

**Dependency Management:**

```
Composer 2.0+
├── Autoloading (PSR-4)
├── Dependency resolution
└── Vendor package management
```

---

### 1.3 Infrastructure & Configuration

**Web Server:**

```
Apache / Nginx (configurable)
├── .htaccess for URL rewriting (Apache)
├── PHP-FPM integration
└── Static file serving
```

**Environment Configuration:**

```
.env File (not committed to repo)
├── DB_HOST=localhost
├── DB_PORT=3306
├── DB_NAME=lms_database
├── DB_USERNAME=db_user
├── DB_PASSWORD=secure_password
├── MAIL_HOST=smtp.gmail.com
├── MAIL_USERNAME=noreply@techcourses.com
├── MAIL_PASSWORD=app_password
├── MAIL_PORT=587
└── GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

**CORS Configuration:**

```php
// backend/common/cors.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

---

## 2. Authentication & Security Architecture

### 2.1 Token-Based Authentication

**Token Generation:**

```php
// Generate cryptographically secure token
function generateToken(): string {
    return bin2hex(random_bytes(32)); // 64 hex characters
}
```

**Token Storage:**

```
Frontend:
├── HTTP-only cookie (cannot access via JavaScript)
├── Name: "authToken"
├── SameSite: Strict
├── Secure: true (HTTPS only in production)
└── Expires: 1 hour from creation

Backend:
├── Database table: auth_tokens
├── Fields: id, user_id, token, expires_at
├── Index on: token (fast lookup)
└── Cleanup: Expired tokens deleted via cron job
```

**Authentication Flow:**

```
1. User Login (POST /api/login/login.php)
   ├── Verify credentials
   ├── Generate 64-char token
   ├── INSERT INTO auth_tokens (user_id, token, expires_at)
   ├── Set HTTP-only cookie with token
   └── Return user data

2. Protected Request (any authenticated endpoint)
   ├── Extract token from cookie
   ├── Query: SELECT user.* FROM users
   │           JOIN auth_tokens ON users.id = auth_tokens.user_id
   │           WHERE auth_tokens.token = ?
   │           AND auth_tokens.expires_at > NOW()
   ├── If valid: Process request with user context
   └── If invalid: Return 401 Unauthorized

3. Logout (POST /api/login/logout.php)
   ├── Extract token from cookie
   ├── DELETE FROM auth_tokens WHERE token = ?
   ├── Clear cookie
   └── Return success
```

---

### 2.2 Password Security

**Hashing Algorithm:**

```php
// Password hashing (on registration/password reset)
$hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT, ['cost' => 10]);

// Password verification (on login)
$isValid = password_verify($plainPassword, $hashedPassword);
```

**Password Requirements:**

- Minimum length: 6 characters
- No maximum length (hashed to fixed 255 chars)
- No complexity requirements (user choice)
- Stored as bcrypt hash (cost factor 10)

**Password Reset Security:**

```
1. Token Generation:
   ├── 64-character random hex string
   ├── Stored in password_reset_tokens table
   ├── Expires in 1 hour
   └── Single-use (used flag prevents reuse)

2. Token Validation:
   ├── Check token exists
   ├── Check not expired (expires_at > NOW())
   ├── Check not used (used = 0)
   └── All must pass for valid token

3. After Reset:
   ├── Update password hash
   ├── Set token used = 1
   ├── Delete all user's auth_tokens (force re-login)
   └── Log password change event
```

---

### 2.3 Rate Limiting

**Login Attempt Tracking:**

```sql
-- Track every login attempt
INSERT INTO login_attempts (user_id, email, was_successful, attempted_at)
VALUES (?, ?, ?, NOW());

-- Check failed attempts in last 5 minutes
SELECT COUNT(*) as failed_count
FROM login_attempts
WHERE email = ?
  AND was_successful = 0
  AND attempted_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE);
```

**Lockout Logic:**

```php
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5; // minutes

if ($failedCount >= MAX_ATTEMPTS) {
    // Get oldest failed attempt
    $oldestAttempt = getOldestFailedAttempt($email);
    $lockoutUntil = date_add($oldestAttempt, date_interval_create_from_date_string('5 minutes'));

    if ($lockoutUntil > now()) {
        $remainingSeconds = $lockoutUntil->getTimestamp() - time();
        return ["error" => "Account locked", "retry_after" => $remainingSeconds];
    }
}
```

**Frontend Countdown:**

```typescript
// Display lockout timer
const [countdown, setCountdown] = useState(retryAfterSeconds);

useEffect(() => {
  if (countdown > 0) {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }
}, [countdown]);

// Display: "Account locked. Try again in 4 minutes 32 seconds"
```

---

### 2.4 Authorization (Role-Based Access Control)

**User Roles:**

```typescript
enum UserRole {
  USER = "user", // Regular user, can browse and enroll
  ADMIN = "admin", // Administrator, full system access
}
```

**Permission Checks:**

**Frontend (UI-level):**

```typescript
// Conditional rendering based on role
{user.role === 'admin' && (
    <button onClick={openAdminPanel}>Admin</button>
)}

// Protected admin routes
<Route
    path="/admin"
    element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />}
/>
```

**Backend (Enforcement):**

```php
// Middleware check in admin endpoints
function requireAdmin($user) {
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: Admin access required']);
        exit;
    }
}

// Usage in controller
$user = verifyAuth(); // Get authenticated user
requireAdmin($user);  // Throws 403 if not admin
// ... proceed with admin operation
```

---

## 3. API Endpoints Reference

### 3.1 Authentication Endpoints

#### **POST /api/login/login.php**

**Purpose:** Standard email/password login

**Request:**

```json
{
  "email": "sarah@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": 3,
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah@example.com",
    "job_title": "Marketing Manager",
    "role": "user",
    "is_active": true
  }
}
```

**Error Responses:**

- **401 Unauthorized:** Invalid credentials
- **423 Locked:** Account locked due to failed attempts
- **403 Forbidden:** Account is inactive

---

#### **POST /api/login/google-login.php**

**Purpose:** OAuth login with Google

**Request:**

```json
{
  "access_token": "ya29.a0AfH6SMBx..."
}
```

**Process:**

1. Exchange access token with Google API
2. Fetch user profile (email, name)
3. Check if user exists in database (by email)
4. If exists: Log in
5. If not exists: Create new user with Google info
6. Return auth token

**Success Response (200):** Same as standard login

---

#### **POST /api/login/register.php**

**Purpose:** Create new user account (no UI, API only)

**Request:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "job_title": "Software Engineer"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "user_id": 15,
  "message": "User registered successfully"
}
```

---

#### **POST /api/login/logout.php**

**Purpose:** End user session

**Request:** None (uses cookie)

**Process:**

1. Extract token from cookie
2. DELETE FROM auth_tokens WHERE token = ?
3. Clear cookie

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### **GET /api/login/verify-auth.php**

**Purpose:** Validate current authentication token

**Request:** None (uses cookie)

**Success Response (200):**

```json
{
  "authenticated": true,
  "user": { ...user object... }
}
```

**Error Response (401):**

```json
{
  "authenticated": false,
  "error": "Invalid or expired token"
}
```

---

#### **POST /api/login/forgot-password.php**

**Purpose:** Request password reset link

**Request:**

```json
{
  "email": "sarah@example.com"
}
```

**Process:**

1. Check if email exists
2. Generate reset token
3. Send email with link
4. Always return success (don't reveal if email exists)

**Success Response (200):**

```json
{
  "success": true,
  "message": "If email exists, reset link sent"
}
```

---

#### **POST /api/login/reset-password.php**

**Purpose:** Complete password reset with token

**Request:**

```json
{
  "token": "abc123...",
  "new_password": "newSecurePass456"
}
```

**Process:**

1. Validate token (exists, not expired, not used)
2. Hash new password
3. Update user password
4. Mark token as used
5. Invalidate all auth tokens for user

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

- **400 Bad Request:** Invalid or expired token
- **400 Bad Request:** Password too short

---

### 3.2 Course Endpoints

#### **GET /api/courses/courses.php**

**Purpose:** Fetch all courses with enrollment counts

**Request:** None

**Success Response (200):**

```json
{
  "success": true,
  "courses": [
    {
      "id": 1,
      "title": "React Fundamentals",
      "short_description": "Learn React basics...",
      "full_description": "Comprehensive React course...",
      "instructor": "Dr. Jane Smith",
      "duration": "8 weeks",
      "capacity": 30,
      "enrolled_count": 18
    },
    ...
  ]
}
```

**SQL Query:**

```sql
SELECT c.*, COUNT(ce.id) as enrolled_count
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
GROUP BY c.id
```

---

#### **POST /api/courses/courses.php**

**Purpose:** Create new course (admin only)

**Request:**

```json
{
  "title": "Python for Data Science",
  "short_description": "Learn Python for data analysis",
  "full_description": "Complete guide to Python...",
  "instructor": "Prof. Chen",
  "duration": "10 weeks",
  "capacity": 25
}
```

**Success Response (201):**

```json
{
  "success": true,
  "course_id": 7,
  "message": "Course created successfully"
}
```

---

#### **PUT /api/courses/courses.php**

**Purpose:** Update existing course (admin only)

**Request:**

```json
{
  "id": 1,
  "title": "Advanced React Development",
  "short_description": "Updated description...",
  "capacity": 35
}
```

**Validation:**

- Cannot reduce capacity below current enrolled_count

**Success Response (200):**

```json
{
  "success": true,
  "message": "Course updated successfully"
}
```

---

#### **DELETE /api/courses/courses.php?id=7**

**Purpose:** Delete course (admin only)

**Request:** Query parameter `id`

**Validation:**

- Cannot delete if enrollments exist (foreign key RESTRICT)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Error Response (409):**

```json
{
  "error": "Cannot delete course with active enrollments"
}
```

---

### 3.3 Enrollment Endpoints

#### **POST /api/courses/enroll.php**

**Purpose:** Enroll authenticated user in course

**Request:**

```json
{
  "course_id": 1
}
```

**Validation:**

1. User not already enrolled (UNIQUE constraint)
2. Course has available capacity
3. User account is active

**Process:**

1. Create enrollment record
2. Send confirmation email
3. Return success

**Success Response (200):**

```json
{
  "success": true,
  "enrollment_id": 42,
  "message": "Successfully enrolled"
}
```

**Error Responses:**

- **409 Conflict:** Already enrolled
- **409 Conflict:** Course is full
- **403 Forbidden:** Account inactive

---

#### **GET /api/courses/enrollments.php?user_id=3**

**Purpose:** Get user's enrolled courses

**Request:** Query parameter `user_id` (optional, defaults to authenticated user)

**Success Response (200):**

```json
{
  "success": true,
  "enrollments": [
    {
      "enrollment_id": 5,
      "course_id": 1,
      "title": "React Fundamentals",
      "instructor": "Dr. Jane Smith",
      "duration": "8 weeks",
      "enrolled_at": "2026-01-15T14:20:00Z",
      "enrolled_count": 18
    },
    ...
  ]
}
```

**SQL Query:**

```sql
SELECT ce.id as enrollment_id, ce.enrolled_at,
       c.*, COUNT(ce2.id) as enrolled_count
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
LEFT JOIN course_enrollments ce2 ON c.id = ce2.course_id
WHERE ce.user_id = ?
GROUP BY ce.id
ORDER BY ce.enrolled_at DESC
```

---

#### **POST /api/courses/unenroll.php**

**Purpose:** Remove user from course

**Request:**

```json
{
  "course_id": 1
}
```

**Process:**

1. Delete enrollment record
2. Update course capacity count
3. Return success

**Success Response (200):**

```json
{
  "success": true,
  "message": "Successfully unenrolled"
}
```

---

### 3.4 User Management Endpoints (Admin Only)

#### **GET /api/users/users.php**

**Purpose:** Fetch all users (admin)

**Success Response (200):**

```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "email": "sarah@example.com",
      "job_title": "Manager",
      "role": "user",
      "is_active": true,
      "created_at": "2026-01-15T10:30:00Z"
    },
    ...
  ]
}
```

---

#### **POST /api/users/users.php**

**Purpose:** Create new user (admin)

**Request:**

```json
{
  "first_name": "Alice",
  "last_name": "Williams",
  "email": "alice@example.com",
  "password": "password123",
  "job_title": "Analyst",
  "role": "user",
  "is_active": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "user_id": 8,
  "message": "User created successfully"
}
```

---

#### **PUT /api/users/users.php**

**Purpose:** Update user (admin)

**Request:**

```json
{
  "id": 3,
  "first_name": "Sarah",
  "last_name": "Johnson",
  "job_title": "Senior Manager",
  "role": "admin"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

#### **DELETE /api/users/users.php?id=8**

**Purpose:** Delete user (admin)

**Process:**

1. Delete all enrollments (CASCADE)
2. Delete all auth tokens (CASCADE)
3. Delete user record
4. Return success

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 3.5 Admin Course Assignment Endpoints

#### **POST /api/user-courses.php**

**Purpose:** Manually assign user to course (admin)

**Request:**

```json
{
  "user_id": 7,
  "course_id": 1
}
```

**Note:** Admin can override capacity limits

**Success Response (200):**

```json
{
  "success": true,
  "enrollment_id": 45,
  "message": "User assigned to course"
}
```

---

#### **DELETE /api/user-courses.php**

**Purpose:** Remove user from course (admin)

**Request:**

```json
{
  "user_id": 7,
  "course_id": 1
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User unassigned from course"
}
```

---

## 4. Frontend Architecture

### 4.1 Component Structure

```
src/
├── components/
│   ├── login/
│   │   ├── Login.tsx              (Login screen with rate limiting)
│   │   ├── ForgotPassword.tsx     (Password reset request)
│   │   └── ResetPassword.tsx      (Password reset form)
│   │
│   └── dashboard/
│       ├── Dashboard.tsx          (Main app hub)
│       ├── Navbar.tsx             (Top navigation)
│       │
│       ├── courses/
│       │   ├── EnrolledCoursesSection.tsx
│       │   ├── EnrolledCourseCard.tsx
│       │   ├── AvailableCoursesSection.tsx
│       │   └── CourseCard.tsx
│       │
│       └── admin/
│           ├── AdminPanel.tsx            (Admin hub modal)
│           ├── ManageUsersModal.tsx      (User CRUD)
│           ├── AddUserModal.tsx          (Create user)
│           ├── AddCourseModal.tsx        (Create course)
│           ├── EditCourseModal.tsx       (Edit course with tabs)
│           ├── AssignCourseModal.tsx     (Manual assignment)
│           └── UnassignCourseModal.tsx   (Bulk unassignment)
│
├── services/
│   ├── axiosInstance.ts          (Configured Axios with interceptors)
│   ├── authService.ts            (Login, logout, verify, password reset)
│   ├── courseService.ts          (Course CRUD, enrollments)
│   └── adminService.ts           (User management, assignments)
│
├── config/
│   └── api.ts                    (API base URL configuration)
│
├── types.ts                      (TypeScript interfaces)
├── App.tsx                       (Main app with routing)
└── main.tsx                      (Entry point)
```

---

### 4.2 State Management

**Authentication State:**

```typescript
// Using React Context API
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Usage in components
const { user, isAuthenticated, logout } = useAuth();
```

**Local Component State:**

```typescript
// Hooks for local state
const [courses, setCourses] = useState<Course[]>([]);
const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

---

### 4.3 API Service Layer

**Axios Instance Configuration:**

```typescript
// services/axiosInstance.ts
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
```

**Service Example:**

```typescript
// services/courseService.ts
import axiosInstance from "./axiosInstance";

export const courseService = {
  // Get all courses
  getAllCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get("/api/courses/courses.php");
    return response.data.courses;
  },

  // Enroll in course
  enrollInCourse: async (courseId: number): Promise<void> => {
    await axiosInstance.post("/api/courses/enroll.php", {
      course_id: courseId,
    });
  },

  // Unenroll from course
  unenrollFromCourse: async (courseId: number): Promise<void> => {
    await axiosInstance.post("/api/courses/unenroll.php", {
      course_id: courseId,
    });
  },
};
```

---

### 4.4 Routing & Protected Routes

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" />;
};
```

---

## 5. Backend Architecture

### 5.1 MVC Structure

```
backend/
├── api/                        (API endpoints - Controllers)
│   ├── login/
│   │   ├── login.php
│   │   ├── google-login.php
│   │   ├── register.php
│   │   ├── logout.php
│   │   ├── verify-auth.php
│   │   ├── forgot-password.php
│   │   └── reset-password.php
│   │
│   ├── courses/
│   │   ├── courses.php         (GET, POST, PUT, DELETE)
│   │   ├── enroll.php
│   │   ├── enrollments.php
│   │   └── unenroll.php
│   │
│   ├── users/
│   │   └── users.php           (Admin CRUD)
│   │
│   └── user-courses.php        (Admin assignments)
│
├── controllers/                (Business logic classes)
│   ├── AuthController.php
│   ├── UserController.php
│   ├── CourseController.php
│   └── EnrollmentController.php
│
├── common/                     (Shared utilities)
│   ├── auth.php                (Token verification)
│   └── cors.php                (CORS headers)
│
└── config/                     (Configuration)
    ├── database.php            (PDO connection)
    └── mail.php                (PHPMailer config)
```

---

### 5.2 Controller Pattern

**Example: AuthController.php**

```php
<?php
class AuthController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function login(string $email, string $password): array {
        // 1. Check rate limiting
        if ($this->isAccountLocked($email)) {
            return ['error' => 'Account locked', 'retry_after' => $this->getLockoutTime($email)];
        }

        // 2. Fetch user by email
        $user = $this->getUserByEmail($email);

        if (!$user) {
            $this->logFailedAttempt($email, null);
            return ['error' => 'Invalid credentials'];
        }

        // 3. Verify password
        if (!password_verify($password, $user['password_hash'])) {
            $this->logFailedAttempt($email, $user['id']);
            return ['error' => 'Invalid credentials'];
        }

        // 4. Check account active
        if (!$user['is_active']) {
            return ['error' => 'Account disabled'];
        }

        // 5. Create auth token
        $token = $this->generateToken();
        $this->saveAuthToken($user['id'], $token);

        // 6. Log successful attempt
        $this->logSuccessfulAttempt($email, $user['id']);

        // 7. Update last_login
        $this->updateLastLogin($user['id']);

        // 8. Return success
        return ['success' => true, 'user' => $this->sanitizeUser($user), 'token' => $token];
    }

    private function generateToken(): string {
        return bin2hex(random_bytes(32));
    }

    // ... other methods
}
```

---

### 5.3 Database Connection

```php
// config/database.php
function getDbConnection(): PDO {
    // Load environment variables
    $host = getenv('DB_HOST') ?: 'localhost';
    $port = getenv('DB_PORT') ?: '3306';
    $dbName = getenv('DB_NAME');
    $username = getenv('DB_USERNAME');
    $password = getenv('DB_PASSWORD');

    $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    return new PDO($dsn, $username, $password, $options);
}
```

---

### 5.4 Prepared Statements (SQL Injection Prevention)

```php
// BAD: SQL Injection vulnerable
$email = $_POST['email'];
$query = "SELECT * FROM users WHERE email = '$email'";  // NEVER DO THIS

// GOOD: Prepared statement
$stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();
```

**Why Prepared Statements:**

1. SQL injection prevention
2. Automatic escaping
3. Query plan caching (performance)
4. Type safety

---

## 6. Email System

### 6.1 PHPMailer Configuration

```php
// config/mail.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function getMailer(): PHPMailer {
    $mail = new PHPMailer(true);

    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = getenv('MAIL_HOST');
    $mail->SMTPAuth = true;
    $mail->Username = getenv('MAIL_USERNAME');
    $mail->Password = getenv('MAIL_PASSWORD');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = getenv('MAIL_PORT') ?: 587;

    // Sender info
    $mail->setFrom('noreply@techcourses.com', 'TechCourses4U');
    $mail->isHTML(true);

    return $mail;
}
```

---

### 6.2 Email Templates

**Password Reset Email:**

```php
function sendPasswordResetEmail(string $email, string $token): void {
    $mail = getMailer();

    $resetLink = "https://techcourses.com/reset-password?token={$token}";

    $mail->addAddress($email);
    $mail->Subject = 'Password Reset Request';

    $mail->Body = "
        <h2>Password Reset Request</h2>
        <p>Hi,</p>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to create a new password:</p>
        <p><a href='{$resetLink}'>Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>TechCourses4U Team</p>
    ";

    $mail->AltBody = "Password reset link: {$resetLink}";

    $mail->send();
}
```

**Enrollment Confirmation Email:**

```php
function sendEnrollmentConfirmation(string $email, array $course): void {
    $mail = getMailer();

    $mail->addAddress($email);
    $mail->Subject = "Course Enrollment Confirmation - {$course['title']}";

    $mail->Body = "
        <h2>Enrollment Confirmation</h2>
        <p>Hi,</p>
        <p>You have successfully enrolled in:</p>
        <ul>
            <li><strong>Course:</strong> {$course['title']}</li>
            <li><strong>Instructor:</strong> {$course['instructor']}</li>
            <li><strong>Duration:</strong> {$course['duration']}</li>
        </ul>
        <p>Access your course from your dashboard:</p>
        <p><a href='https://techcourses.com/dashboard'>Go to Dashboard</a></p>
        <br>
        <p>Happy learning!<br>TechCourses4U Team</p>
    ";

    $mail->send();
}
```

---

## 7. Security Features

### 7.1 HTTPS & Secure Cookies

**Production Configuration:**

```php
// Set secure cookie (HTTPS only in production)
$cookieOptions = [
    'expires' => time() + 3600,  // 1 hour
    'path' => '/',
    'domain' => 'techcourses.com',
    'secure' => true,            // HTTPS only
    'httponly' => true,          // JavaScript cannot access
    'samesite' => 'Strict'       // CSRF protection
];

setcookie('authToken', $token, $cookieOptions);
```

---

### 7.2 Input Validation

**Server-Side Validation:**

```php
function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePassword(string $password): bool {
    return strlen($password) >= 6;
}

function sanitizeInput(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Usage
$email = sanitizeInput($_POST['email']);
if (!validateEmail($email)) {
    throw new InvalidArgumentException('Invalid email format');
}
```

---

### 7.3 CSRF Protection

**Cookie-Based CSRF Prevention:**

- HTTP-only cookies prevent JavaScript access
- SameSite=Strict prevents cross-origin requests
- Token verification on sensitive operations

---

### 7.4 XSS Prevention

**Output Encoding:**

```php
// In API responses (JSON)
echo json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// In HTML output (if any)
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');
```

**React Automatic Escaping:**

- React automatically escapes JSX content
- Prevents XSS in UI rendering

---

## 8. Performance Optimization

### 8.1 Database Optimization

**Indexes:**

```sql
-- Primary keys (auto-indexed)
-- Foreign keys (auto-indexed)

-- Additional indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
```

**Query Optimization:**

- Use JOIN instead of multiple queries
- SELECT only needed columns
- Use LIMIT for pagination
- Avoid N+1 queries

---

### 8.2 Frontend Optimization

**Code Splitting:**

```typescript
// Lazy load admin components
const AdminPanel = lazy(() => import('./components/dashboard/admin/AdminPanel'));

// Usage
<Suspense fallback={<Loading />}>
    <AdminPanel />
</Suspense>
```

**Memoization:**

```typescript
// Memoize expensive computations
const sortedCourses = useMemo(() => {
  return courses.sort((a, b) => a.title.localeCompare(b.title));
}, [courses]);

// Prevent unnecessary re-renders
const CourseCard = memo(({ course }: Props) => {
  // Component code
});
```

---

### 8.3 Caching Strategy

**Backend Caching:**

```php
// Cache course list for 5 minutes (if using Redis/Memcached)
$cacheKey = 'courses_list';
$courses = $cache->get($cacheKey);

if (!$courses) {
    $courses = $db->query("SELECT * FROM courses")->fetchAll();
    $cache->set($cacheKey, $courses, 300);  // 5 minutes
}
```

**Frontend Caching:**

```typescript
// Use React Query for automatic caching
const { data: courses, isLoading } = useQuery("courses", fetchCourses, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## Summary

This technical documentation covers:

1. **Full stack architecture** (React + TypeScript + PHP + MySQL)
2. **Token-based authentication** with 1-hour expiration
3. **Rate limiting** (3 attempts, 5-minute lockout)
4. **RESTful API** with 15+ endpoints
5. **Role-based authorization** (user/admin)
6. **Email system** (password reset, enrollment confirmation)
7. **Security best practices** (bcrypt, prepared statements, HTTPS, CSRF protection)
8. **Performance optimization** (indexes, caching, code splitting)

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Created For:** WAD Portfolio Assignment - Task 1
