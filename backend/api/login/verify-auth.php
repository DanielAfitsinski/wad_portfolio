<?php
// Verify authentication endpoint - checks if user is authenticated
require_once __DIR__ . '/../../controllers/AuthController.php';

AuthController::verifyAuth();
