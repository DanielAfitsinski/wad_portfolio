<?php
// Forgot password endpoint - initiates password reset process
require_once __DIR__ . '/../../controllers/AuthController.php';

AuthController::forgotPassword();