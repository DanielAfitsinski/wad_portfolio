<?php
function setCorsHeaders($allowedMethods = ['GET', 'POST']) {

    if (!is_array($allowedMethods)) {
        $allowedMethods = [$allowedMethods];
    }
    
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: ' . implode(', ', $allowedMethods));
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
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
