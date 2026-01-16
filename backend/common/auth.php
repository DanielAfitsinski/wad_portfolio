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
        $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
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
