<?php
require_once __DIR__ . '/../common/cors.php';
require_once __DIR__ . '/../common/auth.php';
require_once __DIR__ . '/../controllers/UserController.php';

// Set CORS headers
setCorsHeaders(['GET', 'POST', 'DELETE']);

// Verify admin
$user = requireAdminToken();

$method = $_SERVER['REQUEST_METHOD'];
$controller = new UserController();

switch ($method) {
    case 'GET':
        // Get user courses
        $userId = $_GET['user_id'] ?? null;
        if ($userId) {
            echo $controller->getUserCourses($userId);
        } else {
            echo $controller->getAllUserCourses();
        }
        break;
        
    case 'POST':
        // Assign course
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->assignUserToCourse($data);
        break;
        
    case 'DELETE':
        // Remove course
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->removeUserFromCourse($data);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
