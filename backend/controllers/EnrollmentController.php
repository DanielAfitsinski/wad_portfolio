<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mail.php';
require_once __DIR__ . '/../common/cors.php';

class EnrollmentController {
    public static function enroll() {
        setCorsHeaders(['POST']);
        
        validateMethod('POST');

        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['user_id']) || !isset($input['course_id'])){
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: user_id and course_id required']);
            exit();
        }

        $userId = (int)$input['user_id'];
        $courseId = (int)$input['course_id'];

        try {
            $pdo = getDBConnection();

            // Check if the user is already enrolled
            $stmt = $pdo->prepare("SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?");
            $stmt->execute([$userId, $courseId]);
            
            if($stmt->rowCount() > 0){
                http_response_code(409);
                echo json_encode(['error' => 'User already enrolled in this course']);
                exit();
            }

            // Get the course details 
            $stmt = $pdo->prepare("
                SELECT c.id, c.title, c.instructor, c.duration, c.capacity, COUNT(ce.id) AS enrolled
                FROM courses c
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id
                WHERE c.id = ?
                GROUP BY c.id, c.title, c.instructor, c.duration, c.capacity
            ");
            $stmt->execute([$courseId]);
            $courseData = $stmt->fetch();

            if(!$courseData){
                http_response_code(404);
                echo json_encode(['error' => 'Course not found']);
                exit();
            }

            if($courseData['enrolled'] >= $courseData['capacity']){
                http_response_code(409);
                echo json_encode(['error' => 'Course is full']);
                exit();
            }

            // Check if the user exists
            $stmt = $pdo->prepare("SELECT id, email, name FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            
            if($stmt->rowCount() === 0){
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }

            $userData = $stmt->fetch();

            // Enroll the user in the course
            $stmt = $pdo->prepare("
                INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
                VALUES (?, ?, NOW())
            ");
            $stmt->execute([$userId, $courseId]);

            $enrollmentId = $pdo->lastInsertId();
            $enrollmentDate = date('Y-m-d H:i:s');

            // Send the confirmation email
            try {
                sendCourseEnrollmentConfirmationEmail(
                    $userData['email'],
                    $userData['name'],
                    $courseData['title'],
                    $courseData['instructor'],
                    $courseData['duration'],
                    $enrollmentDate
                );
            } catch(Exception $emailError) {
                error_log('Email sending failed: ' . $emailError->getMessage());
            }

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Successfully enrolled in course',
                'enrollmentId' => $enrollmentId
            ]);

        } catch(Exception $e) {
            error_log('Enrollment error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public static function getEnrollments() {
        setCorsHeaders(['GET']);
        
        validateMethod('GET');

        if (!isset($_GET['user_id']) || !is_numeric($_GET['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: user_id is required']);
            exit();
        }

        $userId = (int) $_GET['user_id'];

        try {
            $pdo = getDBConnection();

            $stmt = $pdo->prepare("
                SELECT 
                    c.id,
                    c.title,
                    c.description,
                    c.instructor,
                    c.duration,
                    c.capacity,
                    ce.enrolled_at AS enrollmentDate,
                    ce.id AS enrollmentId,
                    (SELECT COUNT(*) FROM course_enrollments ce2 WHERE ce2.course_id = c.id) AS enrolled
                FROM course_enrollments ce
                JOIN courses c ON c.id = ce.course_id
                WHERE ce.user_id = ?
                ORDER BY ce.enrolled_at DESC
            ");
            $stmt->execute([$userId]);
            $rows = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $rows
            ]);
        } catch (Exception $e) {
            error_log('Enrollments fetch error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public static function unenroll() {
        setCorsHeaders(['POST']);
        
        validateMethod('POST');

        $input = json_decode(file_get_contents('php://input'), true);

        if(!isset($input['enrollment_id']) && !isset($input['user_id']) && !isset($input['course_id'])){
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: enrollment_id OR (user_id + course_id) required']);
            exit();
        }

        try {
            $pdo = getDBConnection();

            $enrollmentId = null;

            // use enrollment_id if provided
            if(isset($input['enrollment_id'])){
                $enrollmentId = (int)$input['enrollment_id'];
            }
            // Otherwise find the enrollment by user_id and course_id
            elseif(isset($input['user_id']) && isset($input['course_id'])){
                $userId = (int)$input['user_id'];
                $courseId = (int)$input['course_id'];
                
                $stmt = $pdo->prepare("SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?");
                $stmt->execute([$userId, $courseId]);
                $enrollment = $stmt->fetch();
                
                if(!$enrollment){
                    http_response_code(404);
                    echo json_encode(['error' => 'Enrollment not found']);
                    exit();
                }
                
                $enrollmentId = $enrollment['id'];
            }

            $stmt = $pdo->prepare("DELETE FROM course_enrollments WHERE id = ?");
            $stmt->execute([$enrollmentId]);

            if($stmt->rowCount() > 0){
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Successfully unenrolled from course'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Enrollment not found']);
            }

        } catch(Exception $e) {
            error_log('Unenrollment error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
}
