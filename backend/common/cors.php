<?php
// CORS configuration for cross-origin requests

// Set CORS headers for allowed origins and methods
function setCorsHeaders($allowedMethods = ['GET', 'POST']) {

    if (!is_array($allowedMethods)) {
        $allowedMethods = [$allowedMethods];
    }
    
    // Define allowed origins for CORS
    $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://ws411479-wad.remote.ac',
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Set Access-Control-Allow-Origin if origin is allowed
    if (in_array($origin, $allowedOrigins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }
    
    header('Content-Type: application/json');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: ' . implode(', ', $allowedMethods));
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Handle OPTIONS preflight request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Validate HTTP request method
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
