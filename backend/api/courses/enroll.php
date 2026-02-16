<?php
// Course enrollment endpoint - delegates to EnrollmentController
require_once __DIR__ . '/../../controllers/EnrollmentController.php';

EnrollmentController::enroll();