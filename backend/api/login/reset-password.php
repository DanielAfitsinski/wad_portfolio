<?php
// Reset password endpoint - completes password reset with token
require_once __DIR__ . '/../../controllers/AuthController.php';

AuthController::resetPassword();