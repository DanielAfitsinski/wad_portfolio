<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if($_SERVER['REQUEST_METHOD'] === 'OPTIONS'){
    http_response_code(200);
    exit();
}

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get token from cookie
$token = $_COOKIE['authToken'] ?? null;

if(!$token){
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorised: No token found']);
    exit;
}

try{
    $pdo = getDBConnection();

    // Delete The Token From The Database
    $stmt = $pdo->prepare("DELETE FROM auth_tokens WHERE token = ?");
    $stmt->execute([$token]);

    // Clear the cookie
    setcookie('authToken', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    if($stmt->rowCount() > 0){
        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }else{
        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}catch(Exception $e){
    error_log("Logout error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>