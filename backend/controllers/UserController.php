<?php
require_once __DIR__ . '/../config/database.php';

class UserController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function getAllUsers() {
        try {
            $users = $this->db->query("
                SELECT id, name, email, job_title, role, is_active, created_at, last_login 
                FROM users 
                ORDER BY created_at DESC
            ");
            
            return json_encode([
                'success' => true,
                'data' => $users
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to fetch users: ' . $e->getMessage()
            ]);
        }
    }
  
    public function createUser($data) {
        try {
            $name = trim($data['name'] ?? '');
            $email = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';
            $job_title = trim($data['job_title'] ?? '');
            $role = $data['role'] ?? 'user';
            $is_active = $data['is_active'] ?? true;
            
            if (empty($name) || empty($email) || empty($password)) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'Name, email, and password are required'
                ]);
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'Invalid email format'
                ]);
            }
            
            if (strlen($password) < 6) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'Password must be at least 6 characters'
                ]);
            }
            
            // Verify email uniqueness
            $existingUser = $this->db->queryOne("SELECT id FROM users WHERE email = ?", [$email]);
            if ($existingUser) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'Email already exists'
                ]);
            }
            
            // Hash password
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            // Create user
            $this->db->execute("
                INSERT INTO users (name, email, job_title, password_hash, role, is_active, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ", [$name, $email, $job_title ?: 'User', $password_hash, $role, $is_active ? 1 : 0]);
            
            $userId = $this->db->lastInsertId();
            
            // Fetch created user
            $user = $this->db->queryOne("
                SELECT id, name, email, job_title, role, is_active, created_at 
                FROM users WHERE id = ?
            ", [$userId]);
            
            return json_encode([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to create user: ' . $e->getMessage()
            ]);
        }
    }
    
    
    public function updateUser($data) {
        try {
            $userId = $data['id'] ?? null;
            $name = trim($data['name'] ?? '');
            $email = trim($data['email'] ?? '');
            $job_title = isset($data['job_title']) ? trim($data['job_title']) : null;
            $role = $data['role'] ?? 'user';
            $is_active = $data['is_active'] ?? true;
            
            if (!$userId) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'User ID is required'
                ]);
            }
            
            // Build update query
            $updates = [];
            $params = [];
            
            if (!empty($name)) {
                $updates[] = "name = ?";
                $params[] = $name;
            }
            
            if (!empty($email)) {
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    return json_encode([
                        'success' => false,
                        'error' => 'Invalid email format'
                    ]);
                }
                $updates[] = "email = ?";
                $params[] = $email;
            }
            
            if (isset($data['job_title'])) {
                $updates[] = "job_title = ?";
                $params[] = $job_title;
            }
            
            if (isset($data['role'])) {
                $updates[] = "role = ?";
                $params[] = $role;
            }
            
            if (isset($data['is_active'])) {
                $updates[] = "is_active = ?";
                $params[] = $is_active ? 1 : 0;
            }
            
            if (empty($updates)) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'No fields to update'
                ]);
            }
            
            $params[] = $userId;
            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
            $this->db->execute($sql, $params);
            
            // Fetch updated user
            $user = $this->db->queryOne("
                SELECT id, name, email, job_title, role, is_active, created_at, last_login 
                FROM users WHERE id = ?
            ", [$userId]);
            
            return json_encode([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to update user: ' . $e->getMessage()
            ]);
        }
    }
    
    
    public function deleteUser($data) {
        try {
            $userId = $data['id'] ?? null;
            
            if (!$userId) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'User ID is required'
                ]);
            }
            
            // Remove enrollments
            $this->db->execute("DELETE FROM course_enrollments WHERE user_id = ?", [$userId]);
            
            // Delete user
            $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode([
                    'success' => false,
                    'error' => 'User not found'
                ]);
            }
            
            return json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to delete user: ' . $e->getMessage()
            ]);
        }
    }
    
   
    public function getAllUserCourses() {
        try {
            $assignments = $this->db->query("
                SELECT 
                    e.id,
                    e.user_id,
                    e.course_id,
                    e.enrolled_at,
                    u.name as user_name,
                    u.email as user_email,
                    c.title as course_title
                FROM course_enrollments e
                JOIN users u ON e.user_id = u.id
                JOIN courses c ON e.course_id = c.id
                ORDER BY e.enrolled_at DESC
            ");
            
            return json_encode([
                'success' => true,
                'data' => $assignments
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to fetch user courses: ' . $e->getMessage()
            ]);
        }
    }
    
    
    public function getUserCourses($userId) {
        try {
            $courses = $this->db->query("
                SELECT 
                    e.id,
                    e.course_id,
                    e.enrolled_at,
                    c.title,
                    c.description,
                    c.instructor,
                    c.duration
                FROM course_enrollments e
                JOIN courses c ON e.course_id = c.id
                WHERE e.user_id = ?
                ORDER BY e.enrolled_at DESC
            ", [$userId]);
            
            return json_encode([
                'success' => true,
                'data' => $courses
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to fetch user courses: ' . $e->getMessage()
            ]);
        }
    }
    
    
    public function assignUserToCourse($data) {
        try {
            $userId = $data['user_id'] ?? null;
            $courseId = $data['course_id'] ?? null;
            
            if (!$userId || !$courseId) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'User ID and Course ID are required'
                ]);
            }
            
            // Verify user exists
            $user = $this->db->queryOne("SELECT id FROM users WHERE id = ?", [$userId]);
            if (!$user) {
                http_response_code(404);
                return json_encode([
                    'success' => false,
                    'error' => 'User not found'
                ]);
            }
            
            // Verify course exists
            $course = $this->db->queryOne("SELECT id, capacity FROM courses WHERE id = ?", [$courseId]);
            if (!$course) {
                http_response_code(404);
                return json_encode([
                    'success' => false,
                    'error' => 'Course not found'
                ]);
            }
            
            // Check existing enrollment
            $existingEnrollment = $this->db->queryOne(
                "SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?",
                [$userId, $courseId]
            );
            if ($existingEnrollment) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'User is already enrolled in this course'
                ]);
            }
            
            // Validate capacity
            $result = $this->db->queryOne(
                "SELECT COUNT(*) as enrolled FROM course_enrollments WHERE course_id = ?",
                [$courseId]
            );
            if ($result['enrolled'] >= $course['capacity']) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'Course is at full capacity'
                ]);
            }
            
            // Create enrollment
            $this->db->execute(
                "INSERT INTO course_enrollments (user_id, course_id, enrolled_at) VALUES (?, ?, NOW())",
                [$userId, $courseId]
            );
            
            return json_encode([
                'success' => true,
                'message' => 'User assigned to course successfully'
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to assign user to course: ' . $e->getMessage()
            ]);
        }
    }
    
  
    public function removeUserFromCourse($data) {
        try {
            $userId = $data['user_id'] ?? null;
            $courseId = $data['course_id'] ?? null;
            
            if (!$userId || !$courseId) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'User ID and Course ID are required'
                ]);
            }
            
            // Delete enrollment
            $stmt = $this->db->prepare("DELETE FROM course_enrollments WHERE user_id = ? AND course_id = ?");
            $stmt->execute([$userId, $courseId]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode([
                    'success' => false,
                    'error' => 'Enrollment not found'
                ]);
            }
            
            return json_encode([
                'success' => true,
                'message' => 'User removed from course successfully'
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to remove user from course: ' . $e->getMessage()
            ]);
        }
    }
}
