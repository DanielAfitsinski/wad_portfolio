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

// Get Input
$input = json_decode(file_get_contents('php://input'), true);

// Validate Input
if(!isset($input['token'])){
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request: Missing token']);
    exit();
}

$token = $input['token'];

try {
    // Get Google user info using the access token
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://www.googleapis.com/oauth2/v2/userinfo');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode !== 200) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorised: Invalid Google token']);
        exit();
    }

    $googleUser = json_decode($response, true);

    if (!isset($googleUser['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Bad Request: Could not retrieve email from Google']);
        exit();
    }

    // Initialise Database Connection
    $pdo = getDBConnection();

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, email, name, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$googleUser['email']]);
    $user = $stmt->fetch();

    // If user doesn't exist, create new user
    if (!$user) {
        $stmt = $pdo->prepare("INSERT INTO users (email, name, password_hash, role, is_active, created_at, last_login) 
                             VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([
            $googleUser['email'],
            $googleUser['name'] ?? $googleUser['email'],
            password_hash(uniqid(), PASSWORD_BCRYPT), //Set random password since OAuth is used anyway
            'user',
            1
        ]);

        $userId = $pdo->lastInsertId();

        $stmt = $pdo->prepare("SELECT id, email, name, role, is_active FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
    } else {
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
    }

    // Check if user is active
    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: Account is inactive']);
        exit();
    }

    // Generate Auth Token
    $authToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Store The Token In The Database
    $stmt = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at, ip_address, user_agent) 
                         VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $user['id'],
        $authToken,
        $expiresAt,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);

    // Set HTTP-only cookie
    setcookie('authToken', $authToken, [
        'expires' => strtotime('+1 hour'),
        'path' => '/',
        'domain' => '',
        'secure' => false, // False for local dev
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    // Return Success Response
    echo json_encode([
        'message' => 'Google login successful',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ]
    ]);

} catch(Exception $e) {
    error_log('Google login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
}
?>