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
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if(!isset($input['token']) || !isset($input['password'])){
    http_response_code(400);
    echo json_encode(['error' => 'Token and password required']);
    exit();
}

$token = $input['token'];
$password = $input['password'];

try{
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("
        SELECT user_id FROM password_reset_tokens
        WHERE token = ? AND expires_at > NOW() AND used = 0
    
    ");
    $stmt->execute([$token]);
    $resetToken = $stmt->fetch();

    if(!$resetToken){
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired reset token']);
        exit();
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$passwordHash, $resetToken['user_id']]);

    $stmt = $pdo->prepare("UPDATE password_reset_tokens SET used = 1 WHERE token = ?");
    $stmt->execute([$token]);
    
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Password reset successfully']);
}
catch(Exception $e){
    error_log('Reset password error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>