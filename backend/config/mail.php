<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function getMailer(){
    require __DIR__ . '/../../vendor/autoload.php';

    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = getenv('MAIL_HOST');
    $mail->SMTPAuth = true;
    $mail->Username = getenv('MAIL_USERNAME');
    $mail->Password = getenv('MAIL_PASSWORD');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = getenv('MAIL_PORT');
    $mail->setFrom(getenv('MAIL_USERNAME'), 'CourseHub');
    $mail->isHTML(true);
    
    return $mail;
}
function sendPasswordResetEmail($email, $name, $resetToken) {
    require __DIR__ . '/../../vendor/autoload.php';
    
    $mail = new PHPMailer(true);
    
    try {

        $isProduction = isset($_SERVER['HTTP_HOST']) && 
                       strpos($_SERVER['HTTP_HOST'], 'ws411479-wad.remote.ac') !== false;
        $baseUrl = $isProduction 
            ? 'https://' . $_SERVER['HTTP_HOST'] 
            : 'http://localhost:5173';
        
        $mail = getMailer();
        $mail->addAddress($email,$name);
        $mail->Subject = 'Password Reset Request';
        
        $resetLink = $baseUrl . "/reset-password?token=" . $resetToken;
        
        $mail->Body = "
            <h2>Password Reset Request</h2>
            <p>Hi {$name},</p>
            <p>Click the link below to reset your password. This link expires in 1 hour.</p>
            <p><a href='{$resetLink}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>Reset Password</a></p>
            <p>Or copy this link: {$resetLink}</p>
            <p>If you didn't request this, ignore this email.</p>
        ";
        
        $mail->AltBody = "Click here to reset your password: {$resetLink}";
        
        return $mail->send();
        
    } catch (Exception $e) {
        error_log("Mail error: {$mail->ErrorInfo}");
        return false;
    }
}

function sendCourseEnrollmentConfirmationEmail($email, $name, $courseTitle, $instructor, $duration, $enrollmentDate){
    try{

        $isProduction = isset($_SERVER['HTTP_HOST']) && 
                       strpos($_SERVER['HTTP_HOST'], 'ws411479-wad.remote.ac') !== false;
        $baseUrl = $isProduction 
            ? 'https://' . $_SERVER['HTTP_HOST'] 
            : 'http://localhost:5173';

        $mail = getMailer();
        $mail->addAddress($email, $name);
        $mail->Subject = 'Course Enrollment Confirmation - ' . $courseTitle;

        $formattedDate = date('F j, Y', strtotime($enrollmentDate));

        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #2c3e50;'>Course Enrollment Confirmation</h2>
                <p>Hi {$name},</p>
                <p>You have successfully enrolled in the following course:</p>
                
                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <h3 style='color: #007bff; margin-top: 0;'>{$courseTitle}</h3>
                    <p style='margin: 10px 0;'><strong>Instructor:</strong> {$instructor}</p>
                    <p style='margin: 10px 0;'><strong>Duration:</strong> {$duration}</p>
                    <p style='margin: 10px 0;'><strong>Enrollment Date:</strong> {$formattedDate}</p>
                </div>
                
                <p>You can view your enrolled courses anytime by logging into your dashboard.</p>
                <p><a href='{$baseUrl}/dashboard' style='background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;'>View Dashboard</a></p>
                
                <p style='margin-top: 30px; color: #6c757d; font-size: 14px;'>If you have any questions, please contact our support team.</p>
                <p style='color: #6c757d; font-size: 14px;'>Thank you for choosing CourseHub!</p>
            </div>
        ";
        
        $mail->AltBody = "Course Enrollment Confirmation\n\n"
                       . "Hi {$name},\n\n"
                       . "You have successfully enrolled in: {$courseTitle}\n"
                       . "Instructor: {$instructor}\n"
                       . "Duration: {$duration}\n"
                       . "Enrollment Date: {$formattedDate}\n\n"
                       . "View your dashboard: {$baseUrl}/dashboard";
        
        return $mail->send();
  
    }catch(Exception $e){
        error_log("Enrollment email error: {$e->getMessage()}");
        return false;
    }
}
?>