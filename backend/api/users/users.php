<?php
require_once __DIR__ . '/../../common/cors.php';
require_once __DIR__ . '/../../common/auth.php';
require_once __DIR__ . '/../../controllers/UserController.php';

// Set CORS headers
setCorsHeaders(['GET', 'POST', 'PUT', 'DELETE']);

// Verify admin
$user = requireAdminToken();

$method = $_SERVER['REQUEST_METHOD'];
$controller = new UserController();

switch ($method) {
    case 'GET':
        // Get users
        echo $controller->getAllUsers();
        break;
        
    case 'POST':
        // Create user
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->createUser($data);
        break;
        
    case 'PUT':
        // Update user
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->updateUser($data);
        break;
        
    case 'DELETE':
        // Delete user
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->deleteUser($data);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
