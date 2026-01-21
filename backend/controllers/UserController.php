<?php
require_once __DIR__ . '/../config/database.php';

class UserController {
    
    
    public function getAllUsers() {
        try {
            $pdo = getDBConnection();
            $stmt = $pdo->query("
                SELECT id, name, email, role, is_active, created_at, last_login 
                FROM users 
                ORDER BY created_at DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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
            $role = $data['role'] ?? 'user';
            $is_active = $data['is_active'] ?? true;
            
            // Validation
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
            
            $pdo = getDBConnection();
            
            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'Email already exists'
                ]);
            }
            
            // Hash password
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert user
            $stmt = $pdo->prepare("
                INSERT INTO users (name, email, password_hash, role, is_active, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$name, $email, $password_hash, $role, $is_active ? 1 : 0]);
            
            $userId = $pdo->lastInsertId();
            
            // Fetch the created user
            $stmt = $pdo->prepare("
                SELECT id, name, email, role, is_active, created_at 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
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
            $role = $data['role'] ?? 'user';
            $is_active = $data['is_active'] ?? true;
            
            if (!$userId) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'User ID is required'
                ]);
            }
            
            $pdo = getDBConnection();
            
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
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            // Fetch updated user
            $stmt = $pdo->prepare("
                SELECT id, name, email, role, is_active, created_at, last_login 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
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
            
            $pdo = getDBConnection();
            
            // Delete user's enrollments first
            $stmt = $pdo->prepare("DELETE FROM course_enrollments WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            // Delete user
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
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
            $pdo = getDBConnection();
            $stmt = $pdo->query("
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
            $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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
            $pdo = getDBConnection();
            $stmt = $pdo->prepare("
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
            ");
            $stmt->execute([$userId]);
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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
            
            $pdo = getDBConnection();
            
            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                return json_encode([
                    'success' => false,
                    'error' => 'User not found'
                ]);
            }
            
            // Check if course exists
            $stmt = $pdo->prepare("SELECT id, capacity FROM courses WHERE id = ?");
            $stmt->execute([$courseId]);
            $course = $stmt->fetch();
            if (!$course) {
                http_response_code(404);
                return json_encode([
                    'success' => false,
                    'error' => 'Course not found'
                ]);
            }
            
            // Check if already enrolled
            $stmt = $pdo->prepare("SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?");
            $stmt->execute([$userId, $courseId]);
            if ($stmt->fetch()) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'User is already enrolled in this course'
                ]);
            }
            
            // Check course capacity
            $stmt = $pdo->prepare("SELECT COUNT(*) as enrolled FROM course_enrollments WHERE course_id = ?");
            $stmt->execute([$courseId]);
            $result = $stmt->fetch();
            if ($result['enrolled'] >= $course['capacity']) {
                http_response_code(400);
                return json_encode([
                    'success' => false,
                    'error' => 'Course is at full capacity'
                ]);
            }
            
            // Enroll user
            $stmt = $pdo->prepare("INSERT INTO course_enrollments (user_id, course_id, enrolled_at) VALUES (?, ?, NOW())");
            $stmt->execute([$userId, $courseId]);
            
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
            
            $pdo = getDBConnection();
            
            // Remove enrollment
            $stmt = $pdo->prepare("DELETE FROM course_enrollments WHERE user_id = ? AND course_id = ?");
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
