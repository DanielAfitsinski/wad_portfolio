<?php
function setCorsHeaders() {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

function handlePreflight() {
    if($_SERVER['REQUEST_METHOD'] === 'OPTIONS'){
        http_response_code(200);
        exit();
    }
}

function validateMethod($allowedMethods) {
    if (!is_array($allowedMethods)) {
        $allowedMethods = [$allowedMethods];
    }
    
    if (!in_array($_SERVER['REQUEST_METHOD'], $allowedMethods)) {
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit();
    }
}
