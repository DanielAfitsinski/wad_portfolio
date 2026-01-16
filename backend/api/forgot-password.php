<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mail.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if(!isset($input['email'])){
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit();
}

$email = trim($input['email']);

try {
    $pdo = getDBConnection();
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC); // Add this
    
    if(!$user){
        // For security, don't reveal if email exists
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'If email exists, reset link will be sent']);
        exit();
    }
    
    // Generate reset token
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Store token in database
    $stmt = $pdo->prepare("
        INSERT INTO password_reset_tokens (user_id, token, expires_at) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$user['id'], $token, $expiresAt]);
    
    // Send email
    $emailSent = sendPasswordResetEmail($email, $user['name'], $token);
    
    if(!$emailSent){
        error_log("Failed to send password reset email to $email");
    }
    
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Reset link sent to your email']);

} catch(Exception $e){
    error_log('Forgot password error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>