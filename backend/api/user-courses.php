<?php
require_once __DIR__ . '/../common/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/UserController.php';

// Set CORS headers for all methods including admin endpoints
setCorsHeaders(['GET', 'POST', 'DELETE']);

$method = $_SERVER['REQUEST_METHOD'];
$controller = new UserController();

// Verify user is authenticated via auth token
$token = $_COOKIE['authToken'] ?? null;

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: Please login']);
    exit();
}

try {
    $pdo = getDBConnection();
    
    // Verify the token and get user info
    $stmt = $pdo->prepare("
        SELECT u.id, u.email, u.name, u.role 
        FROM auth_tokens at
        JOIN users u ON at.user_id = u.id
        WHERE at.token = ? AND at.expires_at > NOW() AND u.is_active = 1
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid or expired token']);
        exit();
    }
    
    // Check if user has admin role
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: Admin access required']);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    exit();
}

switch ($method) {
    case 'GET':
        // Get user's courses or all user-course assignments
        $userId = $_GET['user_id'] ?? null;
        if ($userId) {
            echo $controller->getUserCourses($userId);
        } else {
            echo $controller->getAllUserCourses();
        }
        break;
        
    case 'POST':
        // Assign user to course
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->assignUserToCourse($data);
        break;
        
    case 'DELETE':
        // Remove user from course
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->removeUserFromCourse($data);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
