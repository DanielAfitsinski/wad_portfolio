<?php
require_once __DIR__ . '/../config/database.php';

// Access Control Headers
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


// Only Post Request Allowed
if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}
// Get Input Credentials
$input = json_decode(file_get_contents('php://input'), true);

// Validate Input Was Provided
if(!isset($input['email']) || !isset($input['password'])){
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request: Missing email or password']);
    exit();
}

// Credentials
$email = $input['email'];
$password = $input['password'];

// Rate Limiting Constants
define('MAX_ATTEMPTS', 3);
define('LOCKOUT_DURATION_MINUTES', 5);

try{
    // Initialise Database Connection
    $pdo = getDBConnection();

    // Check if account is locked due to too many failed attempts
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as failed_attempts
        FROM login_attempts
        WHERE email = ? 
        AND success = FALSE
        AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
    ");
    $stmt->execute([$email, LOCKOUT_DURATION_MINUTES]);
    $result = $stmt->fetch();
    $failedAttempts = $result['failed_attempts'] ?? 0;

    if($failedAttempts >= MAX_ATTEMPTS){
        // Calculate time remaining in lockout
        $stmt = $pdo->prepare("
            SELECT MIN(attempted_at) as oldest_attempt
            FROM login_attempts
            WHERE email = ? 
            AND success = FALSE
            AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
        ");
        $stmt->execute([$email, LOCKOUT_DURATION_MINUTES]);
        $oldestAttempt = $stmt->fetch();
        
        $oldestTime = strtotime($oldestAttempt['oldest_attempt']);
        $lockoutEnd = $oldestTime + (LOCKOUT_DURATION_MINUTES * 60);
        $minutesRemaining = ceil(($lockoutEnd - time()) / 60);
        
        http_response_code(429);
        echo json_encode([
            'error' => 'Account locked due to too many failed login attempts',
            'lockedUntil' => $minutesRemaining,
            'message' => "Too many failed login attempts. Please try again in $minutesRemaining minute(s)."
        ]);
        
        // Log the locked attempt
        $stmt = $pdo->prepare("INSERT INTO login_attempts (email, success, ip_address, user_agent) VALUES (?, FALSE, ?, ?)");
        $stmt->execute([$email, $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null]);
        
        exit();
    }

    // Get The User From The Database
    $stmt = $pdo->prepare("SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Verify That The User Exists And The Password Is Correct
    if(!$user || !password_verify($password, $user['password_hash'])){
        // Record failed attempt
        $stmt = $pdo->prepare("INSERT INTO login_attempts (user_id, email, success, ip_address, user_agent) VALUES (?, ?, FALSE, ?, ?)");
        $stmt->execute([$user['id'] ?? null, $email, $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null]);
        
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorised: Invalid email or password']);
        exit();
    }
    // Verify That The User Is Active
    if(!$user['is_active']){
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: Account is inactive']);
        exit();
    }

    // Generate An Auth Token
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Store The Token In The Database
    $stmt = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at, ip_address, user_agent) 
    VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $user['id'],
        $token,
        $expiresAt,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);

    // Record successful login and clear previous failed attempts
    $stmt = $pdo->prepare("INSERT INTO login_attempts (user_id, email, success, ip_address, user_agent) VALUES (?, ?, TRUE, ?, ?)");
    $stmt->execute([$user['id'], $email, $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null]);

    // Update The Last Login
    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Set HTTP-only cookie
    setcookie('authToken', $token, [
        'expires' => strtotime('+1 hour'),
        'path' => '/',
        'domain' => '',
        'secure' => false, // False for dev
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    // Return Success Response With User Info (no token in JSON)
    echo json_encode([
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ]
    ]);

}catch(Exception $e){
    error_log('Login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
}
?>