<?php
// Database configuration and connection management

// Load environment variables from .env file
$envFile = __DIR__ . '/../../.env';
if(file_exists($envFile)){
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach($lines as $line){
        if(strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
    }
}

// Database singleton class for managing connections
class Database {
    private static $instance = null;
    private $connection;

    // Private constructor to prevent direct instantiation
    private function __construct() {
        // Detect if running in production environment
        $isProduction = isset($_SERVER['HTTP_HOST']) && 
                       strpos($_SERVER['HTTP_HOST'], 'ws411479-wad.remote.ac') !== false;
        
        // Get database credentials from environment variables
        $host = $isProduction ? 'localhost' : getenv('DB_HOST');
        $port = getenv('DB_PORT');
        $dbName = getenv('DB_NAME');
        $username = getenv('DB_USERNAME');
        $password = getenv('DB_PASSWORD');

        try {
            $dsn = "mysql:host=$host;port=$port;dbname=$dbName;charset=utf8mb4";
            $this->connection = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch(PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            http_response_code(500);
            throw new Exception('Database connection failed');
        }
    }

    // Get database instance (singleton pattern)
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Execute a query and return all results
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            error_log('Query error: ' . $e->getMessage());
            throw $e;
        }
    }

    // Execute a query and return a single row
    public function queryOne($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch(PDOException $e) {
            error_log('Query error: ' . $e->getMessage());
            throw $e;
        }
    }

    // Execute an insert/update/delete query
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch(PDOException $e) {
            error_log('Execute error: ' . $e->getMessage());
            throw $e;
        }
    }

    // Get the last inserted ID
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }

}