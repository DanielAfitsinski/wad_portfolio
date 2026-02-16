<?php
// Get user enrollments endpoint - delegates to EnrollmentController
require_once __DIR__ . '/../../controllers/EnrollmentController.php';

EnrollmentController::getEnrollments();