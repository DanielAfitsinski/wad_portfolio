<?php
// Authentication controller for user login, registration, and session management

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../common/cors.php';

class AuthController {
    
    // Get database instance
    private static function getDB() {
        return Database::getInstance();
    }

    // Handle user login with email and password
    public static function login() {
        setCorsHeaders(['POST']);
        validateMethod('POST');
        
        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['email']) || !isset($input['password'])){
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: Missing email or password']);
            exit();
        }

        $email = $input['email'];
        $password = $input['password'];

        // Define lockout parameters
        define('MAX_ATTEMPTS', 3);
        define('LOCKOUT_DURATION_MINUTES', 5);

        try{
            $db = self::getDB();

            // Check account lockout status
            $result = $db->queryOne("
                SELECT COUNT(*) as failed_attempts
                FROM login_attempts
                WHERE email = ? 
                AND success = FALSE
                AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
            ", [$email, LOCKOUT_DURATION_MINUTES]);
            $failedAttempts = $result['failed_attempts'] ?? 0;

            // Enforce account lockout if too many failed attempts
            if($failedAttempts >= MAX_ATTEMPTS){
                $oldestAttempt = $db->queryOne("
                    SELECT MIN(attempted_at) as oldest_attempt
                    FROM login_attempts
                    WHERE email = ? 
                    AND success = FALSE
                    AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
                ", [$email, LOCKOUT_DURATION_MINUTES]);
                
                $oldestTime = strtotime($oldestAttempt['oldest_attempt']);
                $lockoutEnd = $oldestTime + (LOCKOUT_DURATION_MINUTES * 60);
                $minutesRemaining = ceil(($lockoutEnd - time()) / 60);
                
                http_response_code(429);
                echo json_encode([
                    'error' => 'Account locked due to too many failed login attempts',
                    'lockedUntil' => $minutesRemaining,
                    'message' => "Too many failed login attempts. Please try again in $minutesRemaining minute(s)."
                ]);
                
                $db->execute("INSERT INTO login_attempts (email, success) VALUES (?, FALSE)", [$email]);
                exit();
            }

            // Fetch user from database
            $user = $db->queryOne(
                "SELECT id, email, password_hash, first_name, last_name, job_title, role, is_active FROM users WHERE email = ?",
                [$email]
            );

            // Verify password and user exists
            if(!$user || !password_verify($password, $user['password_hash'])){
                $db->execute(
                    "INSERT INTO login_attempts (user_id, email, success) VALUES (?, ?, FALSE)",
                    [$user['id'] ?? null, $email]
                );
                
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorised: Invalid email or password']);
                exit();
            }

            // Check if account is active
            if(!$user['is_active']){
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden: Account is inactive']);
                exit();
            }

            // Generate authentication token
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            // Store token in database
            $db->execute(
                "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
                [$user['id'], $token, $expiresAt]
            );

            // Record successful login attempt
            $db->execute("INSERT INTO login_attempts (user_id, email, success) VALUES (?, ?, TRUE)", [$user['id'], $email]);

            // Update last login timestamp
            $db->execute("UPDATE users SET last_login = NOW() WHERE id = ?", [$user['id']]);

            // Set authentication cookie
            setcookie('authToken', $token, [
                'expires' => strtotime('+1 hour'),
                'path' => '/',
                'domain' => '',
                'secure' => $_SERVER['HTTPS'] ?? false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            echo json_encode([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'job_title' => $user['job_title'],
                    'role' => $user['role']
                ]
            ]);

        }catch(Exception $e){
            error_log('Login error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal Server Error']);
        }
    }
    

    public static function logout() {
        setCorsHeaders(['POST']);
        
        validateMethod('POST');

        $token = $_COOKIE['authToken'] ?? null;

        if(!$token){
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorised: No token found']);
            exit;
        }

        try{
            $db = self::getDB();

            $db->execute("DELETE FROM auth_tokens WHERE token = ?", [$token]);

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
        setCorsHeaders(['GET']);
        
        validateMethod('GET');

        $token = $_COOKIE['authToken'] ?? null;

        if(!$token){
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorised: No token found']);
            exit;
        }

        try{
            $db = self::getDB();

            $user = $db->queryOne("
                SELECT u.id, u.email, u.first_name, u.last_name, u.job_title, u.role 
                FROM auth_tokens at
                JOIN users u ON at.user_id = u.id
                WHERE at.token = ? AND at.expires_at > NOW() AND u.is_active = 1
            ", [$token]);

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
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'job_title' => $user['job_title'],
                    'role' => $user['role']
                ]
            ]);

        }catch(Exception $e){
            error_log("Auth verification error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public static function forgotPassword() {
        require_once __DIR__ . '/../config/mail.php';
        
        setCorsHeaders(['POST']);
        
        validateMethod('POST');

        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['email'])){
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            exit();
        }

        $email = trim($input['email']);

        // Validate email format
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email cannot be empty']);
            exit();
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            exit();
        }

        try {
            $db = self::getDB();
            
            $user = $db->queryOne("SELECT id, first_name, last_name FROM users WHERE email = ?", [$email]);
            
            if(!$user){
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'If email exists, reset link will be sent']);
                exit();
            }
            
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $db->execute("
                INSERT INTO password_reset_tokens (user_id, token, expires_at) 
                VALUES (?, ?, ?)
            ", [$user['id'], $token, $expiresAt]);
            
            $fullName = $user['first_name'] . ' ' . $user['last_name'];
            $emailSent = sendPasswordResetEmail($email, $fullName, $token);
            
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

    public static function resetPassword() {
        setCorsHeaders(['POST']);
        
        validateMethod('POST');

        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['token']) || !isset($input['password'])){
            http_response_code(400);
            echo json_encode(['error' => 'Token and password required']);
            exit();
        }

        $token = $input['token'];
        $password = $input['password'];

        // Validate password length
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            exit();
        }

        try{
            $db = self::getDB();

            $resetToken = $db->queryOne("
                SELECT user_id FROM password_reset_tokens
                WHERE token = ? AND expires_at > NOW() AND used = 0
            ", [$token]);

            if(!$resetToken){
                http_response_code(400);
                echo json_encode(['error' => 'Invalid or expired reset token']);
                exit();
            }

            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            $db->execute("UPDATE users SET password_hash = ? WHERE id = ?", [$passwordHash, $resetToken['user_id']]);

            $db->execute("UPDATE password_reset_tokens SET used = 1 WHERE token = ?", [$token]);
            
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Password reset successfully']);
        }
        catch(Exception $e){
            error_log('Reset password error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public static function googleLogin() {
        setCorsHeaders(['POST']);
        
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

            $db = self::getDB();

            $user = $db->queryOne(
                "SELECT id, email, first_name, last_name, job_title, role, is_active FROM users WHERE email = ?",
                [$googleUser['email']]
            );

            if (!$user) {
                $fullName = $googleUser['name'] ?? $googleUser['email'];
                $nameParts = explode(' ', $fullName, 2);
                $firstName = $nameParts[0];
                $lastName = $nameParts[1] ?? '';
                
                $db->execute(
                    "INSERT INTO users (email, first_name, last_name, job_title, password_hash, role, is_active, created_at, last_login) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
                    [
                        $googleUser['email'],
                        $firstName,
                        $lastName,
                        'User',
                        password_hash(uniqid(), PASSWORD_BCRYPT),
                        'user',
                        1
                    ]
                );

                $userId = $db->lastInsertId();

                $user = $db->queryOne(
                    "SELECT id, email, first_name, last_name, job_title, role, is_active FROM users WHERE id = ?",
                    [$userId]
                );
            } else {
                $db->execute("UPDATE users SET last_login = NOW() WHERE id = ?", [$user['id']]);
            }

            if (!$user['is_active']) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden: Account is inactive']);
                exit();
            }

            $authToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $db->execute(
                "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
                [$user['id'], $authToken, $expiresAt]
            );

            setcookie('authToken', $authToken, [
                'expires' => strtotime('+1 hour'),
                'path' => '/',
                'domain' => '',
                'secure' => $_SERVER['HTTPS'] ?? false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            echo json_encode([
                'message' => 'Google login successful',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'job_title' => $user['job_title'],
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
