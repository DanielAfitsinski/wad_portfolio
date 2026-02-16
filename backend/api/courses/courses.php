<?php
// Course CRUD operations endpoint - routes to appropriate controller method
require_once __DIR__ . '/../../controllers/CourseController.php';

$method = $_SERVER['REQUEST_METHOD'];

// Route request to appropriate controller method based on HTTP method
switch ($method) {
    case 'GET':
        CourseController::getCourses();
        break;
    case 'POST':
        CourseController::createCourse();
        break;
    case 'PUT':
        CourseController::updateCourse();
        break;
    case 'DELETE':
        CourseController::deleteCourse();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}