<?php
// Enrollment controller for managing course enrollments and unenrollments

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mail.php';
require_once __DIR__ . '/../common/cors.php';

class EnrollmentController {
    
    // Get database instance
    private static function getDB() {
        return Database::getInstance();
    }
    
    // Enroll user in a course
    public static function enroll() {
        setCorsHeaders(['POST']);
        
        validateMethod('POST');

        $input = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if(!isset($input['user_id']) || !isset($input['course_id'])){
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request: user_id and course_id required']);
            exit();
        }

        $userId = (int)$input['user_id'];
        $courseId = (int)$input['course_id'];

        try {
            $db = self::getDB();

            // Check if user is already enrolled
            $existingEnrollment = $db->queryOne(
                "SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?",
                [$userId, $courseId]
            );
            
            if($existingEnrollment){
                http_response_code(409);
                echo json_encode(['error' => 'User already enrolled in this course']);
                exit();
            }

            // Fetch course details with current enrollment count
            $courseData = $db->queryOne("
                SELECT c.id, c.title, c.instructor, c.start_date, c.end_date, c.capacity, COUNT(ce.id) AS enrolled
                FROM courses c
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id
                WHERE c.id = ?
                GROUP BY c.id, c.title, c.instructor, c.start_date, c.end_date, c.capacity
            ", [$courseId]);

            if(!$courseData){
                http_response_code(404);
                echo json_encode(['error' => 'Course not found']);
                exit();
            }

            // Check if course is at capacity
            if($courseData['enrolled'] >= $courseData['capacity']){
                http_response_code(409);
                echo json_encode(['error' => 'Course is full']);
                exit();
            }

            // Verify user exists
            $userData = $db->queryOne("SELECT id, email, first_name, last_name FROM users WHERE id = ?", [$userId]);
            
            if(!$userData){
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }

            // Create enrollment record
            $db->execute("
                INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
                VALUES (?, ?, NOW())
            ", [$userId, $courseId]);

            $enrollmentId = $db->lastInsertId();
            $enrollmentDate = date('Y-m-d H:i:s');

            // Send confirmation email to user
            try {
                sendCourseEnrollmentConfirmationEmail(
                    $userData['email'],
                    $userData['first_name'] . ' ' . $userData['last_name'],
                    $courseData['title'],
                    $courseData['instructor'],
                    $courseData['start_date'] . ' - ' . $courseData['end_date'],
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
            $db = self::getDB();

            $rows = $db->query("
                SELECT 
                    c.id,
                    c.title,
                    c.description,
                    c.instructor,
                    c.start_date,
                    c.end_date,
                    c.capacity,
                    ce.enrolled_at AS enrollmentDate,
                    ce.id AS enrollmentId,
                    (SELECT COUNT(*) FROM course_enrollments ce2 WHERE ce2.course_id = c.id) AS enrolled
                FROM course_enrollments ce
                JOIN courses c ON c.id = ce.course_id
                WHERE ce.user_id = ?
                ORDER BY ce.enrolled_at DESC
            ", [$userId]);

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
            $db = self::getDB();

            $enrollmentId = null;

            // Get enrollment ID
            if(isset($input['enrollment_id'])){
                $enrollmentId = (int)$input['enrollment_id'];
            }
            // Find enrollment by user and course
            elseif(isset($input['user_id']) && isset($input['course_id'])){
                $userId = (int)$input['user_id'];
                $courseId = (int)$input['course_id'];
                
                $enrollment = $db->queryOne(
                    "SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?",
                    [$userId, $courseId]
                );
                
                if(!$enrollment){
                    http_response_code(404);
                    echo json_encode(['error' => 'Enrollment not found']);
                    exit();
                }
                
                $enrollmentId = $enrollment['id'];
            }

            $rowCount = $db->execute("DELETE FROM course_enrollments WHERE id = ?", [$enrollmentId]);

            if($rowCount > 0){
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
