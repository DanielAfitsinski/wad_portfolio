<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../common/cors.php';

class CourseController {
    
    public static function getCourses() {
        setCorsHeaders();
        handlePreflight();
        validateMethod('GET');

        try{
            $pdo = getDBConnection();

            $stmt = $pdo->prepare("
                SELECT 
                    c.id,
                    c.title,
                    c.description,
                    c.instructor,
                    c.duration,
                    c.capacity,
                    COUNT(ce.id) AS enrolled
                FROM courses c
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id
                GROUP BY c.id, c.title, c.description, c.instructor, c.duration, c.capacity
                ORDER BY c.id
            ");

            $stmt->execute();
            $courses = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $courses
            ]);
        }catch(Exception $e){
            error_log('Courses fetch error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
}
