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

if(!isset($input['name']) || !isset($input['email']) || !isset($input['password'])){
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: name, email, password']);
    exit();
}

$name = trim($input['name']);
$email = trim($input['email']);
$password = $input['password'];

try{
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if($stmt->rowCount() > 0){
        http_response_code(409);
        echo json_encode(['error' => 'Email already registered']);
        exit();
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password_hash, role, is_active) 
        VALUES (?, ?, ?, 'user', 1)
    ");
    $stmt->execute([$name, $email, $passwordHash]);
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully'
    ]);

}catch(Exception $e){
    error_log('Registration error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

?>