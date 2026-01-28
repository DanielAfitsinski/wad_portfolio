<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../common/cors.php';

class CourseController {
    
    private static function getDB() {
        return Database::getInstance();
    }
    
    public static function getCourses() {
        setCorsHeaders(['GET']);
        
        validateMethod('GET');

        try{
            $db = self::getDB();

            $courses = $db->query("
                SELECT 
                    c.id,
                    c.title,
                    c.description,
                    c.full_description,
                    c.instructor,
                    c.duration,
                    c.capacity,
                    COUNT(ce.id) AS enrolled
                FROM courses c
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id
                GROUP BY c.id, c.title, c.description, c.full_description, c.instructor, c.duration, c.capacity
                ORDER BY c.id
            ");

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

    public static function createCourse() {
        setCorsHeaders(['POST']);
        validateMethod('POST');

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['title']) || !isset($data['description']) || 
                !isset($data['instructor']) || !isset($data['duration']) || 
                !isset($data['capacity'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                return;
            }

            // Validate fields
            $title = trim($data['title']);
            $description = trim($data['description']);
            $instructor = trim($data['instructor']);
            $duration = trim($data['duration']);
            $capacity = (int)$data['capacity'];

            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['error' => 'Course title cannot be empty']);
                return;
            }

            if (empty($description)) {
                http_response_code(400);
                echo json_encode(['error' => 'Course description cannot be empty']);
                return;
            }

            if (empty($instructor)) {
                http_response_code(400);
                echo json_encode(['error' => 'Instructor name cannot be empty']);
                return;
            }

            if (empty($duration)) {
                http_response_code(400);
                echo json_encode(['error' => 'Course duration cannot be empty']);
                return;
            }

            if ($capacity < 1 || $capacity > 1000) {
                http_response_code(400);
                echo json_encode(['error' => 'Capacity must be between 1 and 1000']);
                return;
            }

            $db = self::getDB();

            $fullDescription = isset($data['full_description']) ? trim($data['full_description']) : null;
            if ($fullDescription === '') {
                $fullDescription = null;
            }

            $stmt = $db->prepare("
                INSERT INTO courses (title, description, full_description, instructor, duration, capacity)
                VALUES (:title, :description, :full_description, :instructor, :duration, :capacity)
            ");

            $stmt->execute([
                'title' => $title,
                'description' => $description,
                'full_description' => $fullDescription,
                'instructor' => $instructor,
                'duration' => $duration,
                'capacity' => $capacity
            ]);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Course created successfully',
                'id' => $db->lastInsertId()
            ]);
        } catch(Exception $e) {
            error_log('Course creation error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create course']);
        }
    }

    public static function updateCourse() {
        setCorsHeaders(['PUT']);
        validateMethod('PUT');

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Course ID is required']);
                return;
            }

            $db = self::getDB();

            // Build update query
            $fields = [];
            $params = ['id' => $data['id']];

            if (isset($data['title'])) {
                $title = trim($data['title']);
                if (empty($title)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Course title cannot be empty']);
                    return;
                }
                $fields[] = 'title = :title';
                $params['title'] = $title;
            }
            if (isset($data['description'])) {
                $description = trim($data['description']);
                if (empty($description)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Course description cannot be empty']);
                    return;
                }
                $fields[] = 'description = :description';
                $params['description'] = $description;
            }
            if (isset($data['full_description'])) {
                $fullDescription = trim($data['full_description']);
                $fields[] = 'full_description = :full_description';
                $params['full_description'] = $fullDescription ?: null;
            }
            if (isset($data['instructor'])) {
                $instructor = trim($data['instructor']);
                if (empty($instructor)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Instructor name cannot be empty']);
                    return;
                }
                $fields[] = 'instructor = :instructor';
                $params['instructor'] = $instructor;
            }
            if (isset($data['duration'])) {
                $duration = trim($data['duration']);
                if (empty($duration)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Course duration cannot be empty']);
                    return;
                }
                $fields[] = 'duration = :duration';
                $params['duration'] = $duration;
            }
            if (isset($data['capacity'])) {
                $capacity = (int)$data['capacity'];
                
                if ($capacity < 1 || $capacity > 1000) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Capacity must be between 1 and 1000']);
                    return;
                }

                // Validate capacity
                $enrollmentCheck = $db->queryOne("
                    SELECT COUNT(*) as enrolled FROM course_enrollments WHERE course_id = :id
                ", ['id' => $data['id']]);
                $enrolled = $enrollmentCheck['enrolled'];

                if ($capacity < $enrolled) {
                    http_response_code(400);
                    echo json_encode(['error' => "Cannot set capacity lower than current enrollment ($enrolled)"]);
                    return;
                }

                $fields[] = 'capacity = :capacity';
                $params['capacity'] = $capacity;
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                return;
            }

            $sql = "UPDATE courses SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Course updated successfully'
            ]);
        } catch(Exception $e) {
            error_log('Course update error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update course']);
        }
    }

    public static function deleteCourse() {
        setCorsHeaders(['DELETE']);
        validateMethod('DELETE');

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Course ID is required']);
                return;
            }

            $db = self::getDB();

            // Check enrollments
            $enrollmentCheck = $db->queryOne("
                SELECT COUNT(*) as enrolled FROM course_enrollments WHERE course_id = :id
            ", ['id' => $data['id']]);
            $enrolled = $enrollmentCheck['enrolled'];

            if ($enrolled > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Cannot delete course with enrolled students']);
                return;
            }

            $stmt = $db->prepare("DELETE FROM courses WHERE id = :id");
            $stmt->execute(['id' => $data['id']]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Course not found']);
                return;
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Course deleted successfully'
            ]);
        } catch(Exception $e) {
            error_log('Course deletion error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete course']);
        }
    }
}
