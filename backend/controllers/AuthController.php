<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../common/cors.php';

class AuthController {
    

    public static function login() {
        setCorsHeaders();
        handlePreflight();
        validateMethod('POST');
        
        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['email']) || !isset($input['password'])){
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Missing email or password']);
            exit();
        }

        $email = $input['email'];
        $password = $input['password'];

        define('MAX_ATTEMPTS', 3);
        define('LOCKOUT_DURATION_MINUTES', 5);

        try{
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
                
                $stmt = $pdo->prepare("INSERT INTO login_attempts (email, success, ip_address, user_agent) VALUES (?, FALSE, ?, ?)");
                $stmt->execute([$email, $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null]);
                exit();
            }

            // Get the user from the database
            $stmt = $pdo->prepare("SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if(!$user || !password_verify($password, $user['password_hash'])){
                $stmt = $pdo->prepare("INSERT INTO login_attempts (user_id, email, success, ip_address, user_agent) VALUES (?, ?, FALSE, ?, ?)");
                $stmt->execute([$user['id'] ?? null, $email, $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null]);
                
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorised: Invalid email or password']);
                exit();
            }

            if(!$user['is_active']){
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden: Account is inactive']);
                exit();
            }

            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $stmt = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $user['id'],
                $token,
                $expiresAt,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);

            $stmt = $pdo->prepare("INSERT INTO login_attempts (user_id, email, success, ip_address, user_agent) VALUES (?, ?, TRUE, ?, ?)");
            $stmt->execute([$user['id'], $email, $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null]);

            $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);

            setcookie('authToken', $token, [
                'expires' => strtotime('+1 hour'),
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

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
    }
    public static function register() {
        setCorsHeaders();
        handlePreflight();
        validateMethod('POST');

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
    }

    public static function logout() {
        setCorsHeaders();
        handlePreflight();
        validateMethod('POST');

        $token = $_COOKIE['authToken'] ?? null;

        if(!$token){
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorised: No token found']);
            exit;
        }

        try{
            $pdo = getDBConnection();

            $stmt = $pdo->prepare("DELETE FROM auth_tokens WHERE token = ?");
            $stmt->execute([$token]);

            setcookie('authToken', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        }catch(Exception $e){
            error_log("Logout error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public static function verifyAuth() {
        setCorsHeaders();
        handlePreflight();
        validateMethod('GET');

        $token = $_COOKIE['authToken'] ?? null;

        if(!$token){
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorised: No token found']);
            exit;
        }

        try{
            $pdo = getDBConnection();

            $stmt = $pdo->prepare("
                SELECT u.id, u.email, u.name, u.role 
                FROM auth_tokens at
                JOIN users u ON at.user_id = u.id
                WHERE at.token = ? AND at.expires_at > NOW() AND u.is_active = 1
            ");
            $stmt->execute([$token]);
            $user = $stmt->fetch();

            if(!$user){
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorised: Invalid or expired token']);
                exit;
            }

            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ]
            ]);

        }catch(Exception $e){
            error_log("Auth verification error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    /**
     * Forgot Password - Send Reset Link
     */
    public static function forgotPassword() {
        require_once __DIR__ . '/../config/mail.php';
        
        setCorsHeaders();
        handlePreflight();
        validateMethod('POST');

        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['email'])){
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            exit();
        }

        $email = trim($input['email']);

        try {
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(!$user){
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'If email exists, reset link will be sent']);
                exit();
            }
            
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $stmt = $pdo->prepare("
                INSERT INTO password_reset_tokens (user_id, token, expires_at) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$user['id'], $token, $expiresAt]);
            
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
    }

    /**
     * Reset Password
     */
    public static function resetPassword() {
        setCorsHeaders();
        handlePreflight();
        validateMethod('POST');

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
    }

    /**
     * Google Login
     */
    public static function googleLogin() {
        setCorsHeaders();
        handlePreflight();
        validateMethod('POST');

        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['token'])){
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Missing token']);
            exit();
        }

        $token = $input['token'];

        try {
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

            $pdo = getDBConnection();

            $stmt = $pdo->prepare("SELECT id, email, name, role, is_active FROM users WHERE email = ?");
            $stmt->execute([$googleUser['email']]);
            $user = $stmt->fetch();

            if (!$user) {
                $stmt = $pdo->prepare("INSERT INTO users (email, name, password_hash, role, is_active, created_at, last_login) 
                                     VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
                $stmt->execute([
                    $googleUser['email'],
                    $googleUser['name'] ?? $googleUser['email'],
                    password_hash(uniqid(), PASSWORD_BCRYPT),
                    'user',
                    1
                ]);

                $userId = $pdo->lastInsertId();

                $stmt = $pdo->prepare("SELECT id, email, name, role, is_active FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch();
            } else {
                $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                $stmt->execute([$user['id']]);
            }

            if (!$user['is_active']) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden: Account is inactive']);
                exit();
            }

            $authToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $stmt = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at, ip_address, user_agent) 
                                 VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $user['id'],
                $authToken,
                $expiresAt,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);

            setcookie('authToken', $authToken, [
                'expires' => strtotime('+1 hour'),
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

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
    }
}
