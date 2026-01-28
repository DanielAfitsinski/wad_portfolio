<?php
require_once __DIR__ . '/../config/database.php';

function verifyUserSession() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Please login']);
        exit();
    }
    
    return $_SESSION['user_id'];
}

function getCurrentUser() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, job_title, role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch();
    } catch (Exception $e) {
        return null;
    }
}

function requireAuth() {
    $userId = verifyUserSession();
    return $userId;
}

function requireAdmin() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Please login']);
        exit();
    }
    
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access required']);
            exit();
        }
        
        return $user['id'];
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal server error']);
        exit();
    }
}

// Token authentication
function verifyAuthToken() {
    $token = $_COOKIE['authToken'] ?? null;
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Please login']);
        exit();
    }
    
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.name, u.role 
            FROM auth_tokens at
            JOIN users u ON at.user_id = u.id
            WHERE at.token = ? AND at.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Invalid or expired token']);
            exit();
        }
        
        return $user;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal server error']);
        exit();
    }
}

function requireAdminToken() {
    $user = verifyAuthToken();
    
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: Admin access required']);
        exit();
    }
    
    return $user;
}
