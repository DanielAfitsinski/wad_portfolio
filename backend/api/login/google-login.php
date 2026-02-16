<?php
// Google OAuth login endpoint - delegates to AuthController
require_once __DIR__ . '/../../controllers/AuthController.php';

AuthController::googleLogin();