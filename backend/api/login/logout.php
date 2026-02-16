<?php
// Logout endpoint - delegates to AuthController
require_once __DIR__ . '/../../controllers/AuthController.php';

AuthController::logout();