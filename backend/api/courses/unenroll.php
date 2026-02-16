<?php
// Course unenrollment endpoint - delegates to EnrollmentController
require_once __DIR__ . '/../../controllers/EnrollmentController.php';

EnrollmentController::unenroll();