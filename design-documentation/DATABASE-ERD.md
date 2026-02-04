# TechCourses4U - Database Entity Relationship Diagram (ERD)

**Project:** Learning Management System (LMS)  
**Created:** January 2026  
**Purpose:** Assignment Task 1 - Database Design Documentation  
**Database:** MySQL with PDO

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Entity Definitions](#2-entity-definitions)
3. [Relationships & Cardinality](#3-relationships--cardinality)
4. [ERD Visual Representation](#4-erd-visual-representation)
5. [Business Rules & Constraints](#5-business-rules--constraints)
6. [Indexes & Performance](#6-indexes--performance)

---

## 1. Database Overview

### Purpose

The database supports a Learning Management System that manages users, courses, and course enrollments with authentication and security features.

### Database Technology

- **DBMS:** MySQL 8.0+
- **Access Layer:** PHP PDO (Prepared Statements)
- **Character Set:** utf8mb4 (full Unicode support)
- **Collation:** utf8mb4_unicode_ci

### Design Principles

- **Normalization:** 3rd Normal Form (3NF)
- **Data Integrity:** Foreign keys with referential integrity
- **Security:** Password hashing, token-based authentication
- **Auditability:** Timestamp tracking for critical actions

---

## 2. Entity Definitions

### 2.1 Entity: `users`

**Description:** Stores all user accounts (regular users and administrators)

**Primary Key:** `id` (INT, AUTO_INCREMENT)

| Column Name     | Data Type             | Constraints                           | Default           | Description                             |
| --------------- | --------------------- | ------------------------------------- | ----------------- | --------------------------------------- |
| `id`            | INT                   | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | -                 | Unique user identifier                  |
| `first_name`    | VARCHAR(100)          | NOT NULL                              | -                 | User's first name                       |
| `last_name`     | VARCHAR(100)          | NOT NULL                              | -                 | User's last name                        |
| `email`         | VARCHAR(255)          | UNIQUE, NOT NULL                      | -                 | User's email address (login identifier) |
| `password_hash` | VARCHAR(255)          | NOT NULL                              | -                 | Bcrypt hashed password                  |
| `job_title`     | VARCHAR(100)          | NULL                                  | NULL              | User's job title or position            |
| `role`          | ENUM('user', 'admin') | NOT NULL                              | 'user'            | User's role for authorization           |
| `is_active`     | BOOLEAN               | NOT NULL                              | 1 (true)          | Account status (1=active, 0=inactive)   |
| `created_at`    | DATETIME              | NOT NULL                              | CURRENT_TIMESTAMP | Account creation timestamp              |
| `last_login`    | DATETIME              | NULL                                  | NULL              | Last successful login timestamp         |

**Unique Constraints:**

- `email` - Ensures no duplicate email addresses

**Indexes:**

- PRIMARY: `id`
- UNIQUE: `email`
- INDEX: `role` (for admin filtering)
- INDEX: `is_active` (for active user queries)

**Sample Data:**

```sql
id: 1
first_name: 'Sarah'
last_name: 'Johnson'
email: 'sarah@example.com'
password_hash: '$2y$10$...' (bcrypt hash)
job_title: 'Marketing Manager'
role: 'user'
is_active: 1
created_at: '2026-01-15 10:30:00'
last_login: '2026-01-28 09:15:00'
```

**Business Rules:**

- Email must be unique across all users
- Password must be hashed using bcrypt before storage
- `is_active = 0` prevents user login
- `role = 'admin'` grants administrative privileges
- `last_login` updates on successful authentication

---

### 2.2 Entity: `courses`

**Description:** Stores all course offerings available in the system

**Primary Key:** `id` (INT, AUTO_INCREMENT)

| Column Name         | Data Type    | Constraints                           | Default | Description                       |
| ------------------- | ------------ | ------------------------------------- | ------- | --------------------------------- |
| `id`                | INT          | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | -       | Unique course identifier          |
| `title`             | VARCHAR(255) | NOT NULL                              | -       | Course title/name                 |
| `short_description` | TEXT         | NOT NULL                              | -       | Brief overview (shown on cards)   |
| `full_description`  | TEXT         | NULL                                  | NULL    | Detailed description (expandable) |
| `instructor`        | VARCHAR(100) | NOT NULL                              | -       | Instructor's name                 |
| `duration`          | VARCHAR(50)  | NOT NULL                              | -       | Course duration (e.g., "8 weeks") |
| `capacity`          | INT          | NOT NULL                              | -       | Maximum enrollment capacity       |

**Indexes:**

- PRIMARY: `id`
- INDEX: `title` (for search/filtering)

**Check Constraints (Application-Level):**

- `capacity` must be between 1 and 1000
- `capacity` cannot be reduced below current enrollment count

**Sample Data:**

```sql
id: 1
title: 'Advanced Web Development with React'
short_description: 'Learn modern web development using React, including hooks, state management, and API integration.'
full_description: 'This comprehensive course covers React fundamentals, advanced patterns, testing, performance optimization, and deployment. Prerequisites: HTML, CSS, JavaScript.'
instructor: 'Dr. Jane Smith'
duration: '8 weeks'
capacity: 30
```

**Business Rules:**

- `short_description` is required (displayed on course cards)
- `full_description` is optional (shown when user expands course details)
- `duration` is free-text to allow flexibility ("8 weeks", "3 months", "Self-paced")
- Capacity limits are enforced at enrollment time
- Course cannot be deleted if it has active enrollments

---

### 2.3 Entity: `course_enrollments`

**Description:** Junction table linking users to courses (many-to-many relationship)

**Primary Key:** `id` (INT, AUTO_INCREMENT)

**Foreign Keys:**

- `user_id` → `users(id)`
- `course_id` → `courses(id)`

| Column Name   | Data Type | Constraints                           | Default           | Description                  |
| ------------- | --------- | ------------------------------------- | ----------------- | ---------------------------- |
| `id`          | INT       | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | -                 | Unique enrollment identifier |
| `user_id`     | INT       | FOREIGN KEY, NOT NULL                 | -                 | Reference to enrolled user   |
| `course_id`   | INT       | FOREIGN KEY, NOT NULL                 | -                 | Reference to enrolled course |
| `enrolled_at` | DATETIME  | NOT NULL                              | CURRENT_TIMESTAMP | Enrollment timestamp         |

**Unique Constraints:**

- UNIQUE (`user_id`, `course_id`) - Prevents duplicate enrollments

**Foreign Key Constraints:**

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
```

**Indexes:**

- PRIMARY: `id`
- UNIQUE: (`user_id`, `course_id`)
- INDEX: `user_id` (for user enrollment queries)
- INDEX: `course_id` (for course enrollment count)

**Sample Data:**

```sql
id: 1
user_id: 3 (Sarah Johnson)
course_id: 1 (React Course)
enrolled_at: '2026-01-15 14:20:00'
```

**Business Rules:**

- A user can only enroll in a course once (enforced by UNIQUE constraint)
- Enrollment timestamp captures when user joined the course
- Deleting a user cascades delete to their enrollments
- Deleting a course is restricted if enrollments exist
- System sends confirmation email upon enrollment creation

**Cascade Behavior:**

- **ON DELETE CASCADE for `user_id`:** When a user is deleted, all their enrollments are automatically removed
- **ON DELETE RESTRICT for `course_id`:** Prevents course deletion if enrollments exist

---

### 2.4 Entity: `auth_tokens`

**Description:** Stores active authentication session tokens for logged-in users

**Primary Key:** `id` (INT, AUTO_INCREMENT)

**Foreign Keys:**

- `user_id` → `users(id)`

| Column Name  | Data Type   | Constraints                           | Default | Description                     |
| ------------ | ----------- | ------------------------------------- | ------- | ------------------------------- |
| `id`         | INT         | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | -       | Token record identifier         |
| `user_id`    | INT         | FOREIGN KEY, NOT NULL                 | -       | Reference to authenticated user |
| `token`      | VARCHAR(64) | UNIQUE, NOT NULL                      | -       | Random authentication token     |
| `expires_at` | DATETIME    | NOT NULL                              | -       | Token expiration timestamp      |

**Unique Constraints:**

- `token` - Ensures no duplicate tokens

**Foreign Key Constraints:**

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Indexes:**

- PRIMARY: `id`
- UNIQUE: `token` (for fast token lookup)
- INDEX: `user_id`
- INDEX: `expires_at` (for cleanup queries)

**Sample Data:**

```sql
id: 1
user_id: 3
token: 'a1b2c3d4e5f6...' (64 hexadecimal characters)
expires_at: '2026-01-28 10:15:00' (1 hour from creation)
```

**Business Rules:**

- Token is a 64-character hexadecimal string (randomly generated)
- Token expires 1 hour after creation
- Stored in HTTP-only cookie on client side
- Used for session validation on protected routes
- Deleted on user logout
- Deleting user cascades delete to their tokens
- Expired tokens should be periodically cleaned from database

**Token Generation:**

- Generated using `bin2hex(random_bytes(32))` (produces 64 hex chars)
- Cryptographically secure random generation

---

### 2.5 Entity: `login_attempts`

**Description:** Tracks login attempts for rate limiting and security auditing

**Primary Key:** `id` (INT, AUTO_INCREMENT)

**Foreign Keys:**

- `user_id` → `users(id)` (NULLABLE)

| Column Name      | Data Type    | Constraints                           | Default           | Description                  |
| ---------------- | ------------ | ------------------------------------- | ----------------- | ---------------------------- |
| `id`             | INT          | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | -                 | Attempt record identifier    |
| `user_id`        | INT          | FOREIGN KEY, NULL                     | NULL              | Reference to user (if found) |
| `email`          | VARCHAR(255) | NOT NULL                              | -                 | Email used in login attempt  |
| `was_successful` | BOOLEAN      | NOT NULL                              | -                 | Whether attempt succeeded    |
| `attempted_at`   | DATETIME     | NOT NULL                              | CURRENT_TIMESTAMP | Attempt timestamp            |

**Foreign Key Constraints:**

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
```

**Indexes:**

- PRIMARY: `id`
- INDEX: `user_id`
- INDEX: `email`
- INDEX: `attempted_at` (for time-based queries)
- COMPOSITE INDEX: (`email`, `was_successful`, `attempted_at`) (for rate limiting)

**Sample Data:**

```sql
-- Failed attempt
id: 1
user_id: 3
email: 'sarah@example.com'
was_successful: 0 (false)
attempted_at: '2026-01-28 09:10:00'

-- Successful attempt
id: 2
user_id: 3
email: 'sarah@example.com'
was_successful: 1 (true)
attempted_at: '2026-01-28 09:15:00'
```

**Business Rules:**

- Records both successful and failed login attempts
- `user_id` is NULL if email doesn't exist in system
- Rate limiting logic:
  - Count failed attempts for email within last 5 minutes
  - If ≥3 failed attempts, lock account for 5 minutes
- Failed attempts reset after successful login
- Supports security auditing and breach detection
- Old records can be archived/deleted for performance

**Rate Limiting Query:**

```sql
SELECT COUNT(*) FROM login_attempts
WHERE email = ?
  AND was_successful = 0
  AND attempted_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
```

---

### 2.6 Entity: `password_reset_tokens`

**Description:** Stores password reset tokens sent via email for forgotten passwords

**Primary Key:** `id` (INT, AUTO_INCREMENT)

**Foreign Keys:**

- `user_id` → `users(id)`

| Column Name  | Data Type   | Constraints                           | Default   | Description                        |
| ------------ | ----------- | ------------------------------------- | --------- | ---------------------------------- |
| `id`         | INT         | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | -         | Token record identifier            |
| `user_id`    | INT         | FOREIGN KEY, NOT NULL                 | -         | Reference to user requesting reset |
| `token`      | VARCHAR(64) | UNIQUE, NOT NULL                      | -         | Random reset token                 |
| `expires_at` | DATETIME    | NOT NULL                              | -         | Token expiration timestamp         |
| `used`       | BOOLEAN     | NOT NULL                              | 0 (false) | Whether token has been used        |

**Unique Constraints:**

- `token` - Ensures no duplicate tokens

**Foreign Key Constraints:**

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Indexes:**

- PRIMARY: `id`
- UNIQUE: `token` (for fast token lookup)
- INDEX: `user_id`
- INDEX: `expires_at`
- COMPOSITE INDEX: (`token`, `used`, `expires_at`) (for validation)

**Sample Data:**

```sql
id: 1
user_id: 3
token: 'x1y2z3...' (64 hexadecimal characters)
expires_at: '2026-01-28 10:30:00' (1 hour from creation)
used: 0
```

**Business Rules:**

- Token is a 64-character hexadecimal string (randomly generated)
- Token expires 1 hour after creation
- Token can only be used once (`used` flag prevents reuse)
- Sent via email to user's registered email address
- Valid token requirements:
  - Must exist in database
  - Must not be expired (`expires_at > NOW()`)
  - Must not be used (`used = 0`)
- After successful password reset, `used` is set to 1
- Deleting user cascades delete to their reset tokens

**Security Considerations:**

- Token included in email link: `https://domain.com/reset-password?token={token}`
- One-time use prevents replay attacks
- Expiration prevents indefinite validity
- Non-existent emails still return success message (prevent email enumeration)

---

## 3. Relationships & Cardinality

### 3.1 Relationship Matrix

| Entity 1  | Relationship | Entity 2                | Type         | Foreign Key                     |
| --------- | ------------ | ----------------------- | ------------ | ------------------------------- |
| `users`   | enrolls in   | `courses`               | Many-to-Many | Via `course_enrollments`        |
| `users`   | has          | `auth_tokens`           | One-to-Many  | `auth_tokens.user_id`           |
| `users`   | has          | `login_attempts`        | One-to-Many  | `login_attempts.user_id`        |
| `users`   | has          | `password_reset_tokens` | One-to-Many  | `password_reset_tokens.user_id` |
| `courses` | has          | `course_enrollments`    | One-to-Many  | `course_enrollments.course_id`  |

---

### 3.2 Detailed Relationship Descriptions

#### Relationship 1: Users ↔ Courses (Many-to-Many)

**Relationship Type:** Many-to-Many  
**Junction Table:** `course_enrollments`

**Cardinality:**

- **One User** can enroll in **Many Courses** (0..\*)
- **One Course** can have **Many Users** enrolled (0..\*)

**Implementation:**

```
users (1) ←→ (M) course_enrollments (M) ←→ (1) courses
```

**Foreign Keys:**

- `course_enrollments.user_id` → `users.id` (ON DELETE CASCADE)
- `course_enrollments.course_id` → `courses.id` (ON DELETE RESTRICT)

**Business Logic:**

- A user can browse courses without enrolling (0 courses)
- A user can enroll in multiple courses simultaneously
- A course can exist without enrollments (0 users)
- A course can have many users up to its capacity limit
- The junction table stores the enrollment timestamp

**Example:**

```
User: Sarah Johnson (id=3)
  → Enrolled in: React Course (id=1), Python Course (id=2)

Course: React Course (id=1)
  → Enrolled users: Sarah (id=3), John (id=5), Alice (id=7)
```

---

#### Relationship 2: Users → Auth Tokens (One-to-Many)

**Relationship Type:** One-to-Many

**Cardinality:**

- **One User** can have **Many Auth Tokens** (0..\*)
- **One Auth Token** belongs to **One User** (1)

**Foreign Key:**

- `auth_tokens.user_id` → `users.id` (ON DELETE CASCADE)

**Business Logic:**

- A user can be logged in from multiple devices/browsers simultaneously
- Each session gets its own unique token
- When user logs out from one device, only that token is deleted
- When user is deleted, all their tokens are deleted (cascade)

**Example:**

```
User: Sarah Johnson (id=3)
  → Active Tokens:
    - Token 1: Desktop browser (expires 10:00 AM)
    - Token 2: Mobile app (expires 11:30 AM)
```

---

#### Relationship 3: Users → Login Attempts (One-to-Many)

**Relationship Type:** One-to-Many

**Cardinality:**

- **One User** can have **Many Login Attempts** (0..\*)
- **One Login Attempt** belongs to **One User** (0..1)

**Foreign Key:**

- `login_attempts.user_id` → `users.id` (ON DELETE SET NULL)

**Business Logic:**

- Tracks all login attempts (successful and failed)
- `user_id` can be NULL if email doesn't exist
- Used for rate limiting and security auditing
- Multiple failed attempts trigger account lockout

**Example:**

```
User: Sarah Johnson (id=3)
  → Login Attempts:
    - Attempt 1: Failed (09:10 AM) - wrong password
    - Attempt 2: Failed (09:12 AM) - wrong password
    - Attempt 3: Successful (09:15 AM) - correct password
```

---

#### Relationship 4: Users → Password Reset Tokens (One-to-Many)

**Relationship Type:** One-to-Many

**Cardinality:**

- **One User** can have **Many Password Reset Tokens** (0..\*)
- **One Password Reset Token** belongs to **One User** (1)

**Foreign Key:**

- `password_reset_tokens.user_id` → `users.id` (ON DELETE CASCADE)

**Business Logic:**

- User can request multiple password resets (creates new tokens)
- Only the most recent token is typically used
- Old tokens expire after 1 hour
- Once used, token is marked and cannot be reused
- When user is deleted, all their reset tokens are deleted

**Example:**

```
User: Sarah Johnson (id=3)
  → Reset Tokens:
    - Token 1: Expired (requested yesterday, not used)
    - Token 2: Active (requested 30 mins ago, valid until 10:30 AM)
```

---

#### Relationship 5: Courses → Course Enrollments (One-to-Many)

**Relationship Type:** One-to-Many

**Cardinality:**

- **One Course** can have **Many Enrollments** (0..capacity)
- **One Enrollment** belongs to **One Course** (1)

**Foreign Key:**

- `course_enrollments.course_id` → `courses.id` (ON DELETE RESTRICT)

**Business Logic:**

- Enrollments are limited by course capacity
- Cannot delete course if enrollments exist (RESTRICT)
- Enrollment count is calculated dynamically
- Used to display course availability

**Example:**

```
Course: React Course (id=1, capacity=30)
  → Enrollments (18):
    - Enrollment 1: Sarah (user_id=3, enrolled Jan 15)
    - Enrollment 2: John (user_id=5, enrolled Jan 16)
    - ... (16 more enrollments)
  → Available spots: 12
```

---

## 4. ERD Visual Representation

### 4.1 Crow's Foot Notation ERD

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA DIAGRAM                         │
│                      TechCourses4U Learning Management System            │
└─────────────────────────────────────────────────────────────────────────┘


┌───────────────────────────┐
│        USERS              │
├───────────────────────────┤
│ 🔑 id (PK)                │
│    first_name             │
│    last_name              │
│ 🔒 email (UNIQUE)         │
│    password_hash          │
│    job_title              │
│    role                   │
│    is_active              │
│    created_at             │
│    last_login             │
└───────────────────────────┘
         │
         │ 1
         │
         ├──────────────────────────────────────┐
         │                                      │
         │                                      │
         │                                      │
         │ *                                    │ *
         ∨                                      ∨
┌─────────────────────┐              ┌───────────────────────┐
│   AUTH_TOKENS       │              │   LOGIN_ATTEMPTS      │
├─────────────────────┤              ├───────────────────────┤
│ 🔑 id (PK)          │              │ 🔑 id (PK)            │
│ 🔗 user_id (FK)     │              │ 🔗 user_id (FK, NULL) │
│ 🔒 token (UNIQUE)   │              │    email              │
│    expires_at       │              │    was_successful     │
└─────────────────────┘              │    attempted_at       │
                                     └───────────────────────┘
         │
         │ 1
         │
         │
         │ *
         ∨
┌──────────────────────────┐
│ PASSWORD_RESET_TOKENS    │
├──────────────────────────┤
│ 🔑 id (PK)               │
│ 🔗 user_id (FK)          │
│ 🔒 token (UNIQUE)        │
│    expires_at            │
│    used                  │
└──────────────────────────┘




┌───────────────────────────┐
│        USERS              │
├───────────────────────────┤
│ 🔑 id (PK)                │
│    ...                    │
└───────────────────────────┘
         │
         │ 1
         │
         │
         │ *
         ∨
┌───────────────────────────┐                ┌───────────────────────────┐
│   COURSE_ENROLLMENTS      │                │        COURSES            │
│   (Junction Table)        │                ├───────────────────────────┤
├───────────────────────────┤                │ 🔑 id (PK)                │
│ 🔑 id (PK)                │      * ←────── │    title                  │
│ 🔗 user_id (FK)           │──────→ 1       │    short_description      │
│ 🔗 course_id (FK)         │                │    full_description       │
│    enrolled_at            │                │    instructor             │
│ 🔒 UNIQUE(user_id,        │                │    duration               │
│           course_id)      │                │    capacity               │
└───────────────────────────┘                └───────────────────────────┘


LEGEND:
─────
🔑 = Primary Key
🔗 = Foreign Key
🔒 = Unique Constraint
1  = One (relationship cardinality)
*  = Many (relationship cardinality)
```

---

### 4.2 Simplified Entity Relationship Diagram

```
                        ┌─────────────────┐
                        │     USERS       │
                        │   (id, email,   │
                        │   password,     │
                        │   role, ...)    │
                        └────────┬────────┘
                                 │
                                 │ 1:M
               ┌─────────────────┼─────────────────┬──────────────────┐
               │                 │                 │                  │
               ∨                 ∨                 ∨                  ∨
      ┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐
      │ AUTH_TOKENS    │ │LOGIN_ATTEMPTS│ │RESET_TOKENS  │ │COURSE_          │
      │                │ │              │ │              │ │ENROLLMENTS      │
      └────────────────┘ └──────────────┘ └──────────────┘ └────────┬────────┘
                                                                     │
                                                                     │ M:1
                                                                     ∨
                                                            ┌─────────────────┐
                                                            │    COURSES      │
                                                            │  (id, title,    │
                                                            │  capacity, ...) │
                                                            └─────────────────┘


RELATIONSHIPS:
──────────────
1. users → auth_tokens (1:M)
2. users → login_attempts (1:M)
3. users → password_reset_tokens (1:M)
4. users ↔ courses via course_enrollments (M:M)
5. courses → course_enrollments (1:M)
```

---

### 4.3 ERD with Cascade Behavior

```
┌──────────────┐
│    USERS     │
└──────┬───────┘
       │
       │ ON DELETE:
       │
       ├─ CASCADE ──→ auth_tokens (deleted)
       ├─ CASCADE ──→ password_reset_tokens (deleted)
       ├─ CASCADE ──→ course_enrollments (deleted)
       └─ SET NULL ─→ login_attempts (user_id = NULL)


┌──────────────┐
│   COURSES    │
└──────┬───────┘
       │
       │ ON DELETE:
       │
       └─ RESTRICT ─→ course_enrollments (prevents delete if enrollments exist)
```

---

## 5. Business Rules & Constraints

### 5.1 Enrollment Business Rules

**Rule 1: Unique Enrollment**

- A user cannot enroll in the same course twice
- **Enforcement:** UNIQUE constraint on (`user_id`, `course_id`)
- **Error Message:** "You are already enrolled in this course"

**Rule 2: Capacity Limit**

- Course cannot exceed its capacity
- **Enforcement:** Application-level check before creating enrollment
- **Calculation:** `COUNT(enrollments) < course.capacity`
- **Error Message:** "This course is full"

**Rule 3: Active User Requirement**

- Only active users can enroll in courses
- **Enforcement:** Application-level check
- **Validation:** `user.is_active = 1`
- **Error Message:** "Your account is inactive. Contact administrator."

**Rule 4: Enrollment Cascade**

- When a user is deleted, their enrollments are automatically removed
- **Enforcement:** Foreign key ON DELETE CASCADE
- **Impact:** Frees up course capacity when user is deleted

**Rule 5: Course Deletion Restriction**

- Courses with enrollments cannot be deleted
- **Enforcement:** Foreign key ON DELETE RESTRICT
- **Alternative:** Admin must manually unenroll all users first
- **Error Message:** "Cannot delete course with active enrollments"

---

### 5.2 Authentication & Security Rules

**Rule 6: Password Storage**

- Passwords must never be stored in plain text
- **Enforcement:** Application-level (bcrypt hashing before INSERT/UPDATE)
- **Hash Algorithm:** Bcrypt with cost factor 10
- **Storage:** `password_hash` column (VARCHAR 255)

**Rule 7: Email Uniqueness**

- Each email address can only have one account
- **Enforcement:** UNIQUE constraint on `users.email`
- **Error Message:** "Email already registered"

**Rule 8: Token Expiration**

- Auth tokens expire 1 hour after creation
- **Enforcement:** Application-level check
- **Validation:** `auth_tokens.expires_at > NOW()`
- **Cleanup:** Periodic cron job to delete expired tokens

**Rule 9: Rate Limiting**

- Maximum 3 failed login attempts within 5 minutes
- **Enforcement:** Application-level query on `login_attempts`
- **Lockout Duration:** 5 minutes from oldest failed attempt
- **Calculation:**
  ```sql
  SELECT COUNT(*) FROM login_attempts
  WHERE email = ? AND was_successful = 0
    AND attempted_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
  ```

**Rule 10: One-Time Password Reset**

- Each password reset token can only be used once
- **Enforcement:** `password_reset_tokens.used` flag
- **Update:** Set `used = 1` after successful password reset
- **Validation:** Check `used = 0` before allowing reset

---

### 5.3 Data Integrity Rules

**Rule 11: Required Fields**

- All NOT NULL fields must have values
- **Users:** first_name, last_name, email, password_hash, role, is_active, created_at
- **Courses:** title, short_description, instructor, duration, capacity
- **Enrollments:** user_id, course_id, enrolled_at

**Rule 12: Role Validation**

- User role must be either 'user' or 'admin'
- **Enforcement:** ENUM data type
- **Default:** 'user'

**Rule 13: Capacity Bounds**

- Course capacity must be between 1 and 1000
- **Enforcement:** Application-level validation
- **Edit Constraint:** Cannot reduce capacity below current enrollment count

**Rule 14: Email Format**

- Email must be valid format
- **Enforcement:** Application-level regex validation
- **Pattern:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

### 5.4 Audit & Compliance Rules

**Rule 15: Timestamp Tracking**

- All time-sensitive actions must be logged
- **Enrollment:** `course_enrollments.enrolled_at`
- **Account Creation:** `users.created_at`
- **Last Login:** `users.last_login`
- **Login Attempts:** `login_attempts.attempted_at`

**Rule 16: Soft Delete Consideration**

- Currently using hard delete with cascades
- **Future Enhancement:** Add `deleted_at` column for soft deletes
- **Benefit:** Maintains audit trail, allows data recovery

---

## 6. Indexes & Performance

### 6.1 Index Strategy

**Primary Keys (Clustered Indexes):**

- All tables have AUTO_INCREMENT `id` as PRIMARY KEY
- Provides fast lookups by ID
- Automatically indexed

**Unique Indexes:**

- `users.email` - Fast user lookup by email (login)
- `auth_tokens.token` - Fast session validation
- `password_reset_tokens.token` - Fast reset token validation
- `course_enrollments(user_id, course_id)` - Prevents duplicates, fast enrollment checks

**Foreign Key Indexes:**

- Automatically created on all foreign key columns
- Improves JOIN performance
- Speeds up cascade operations

**Composite Indexes:**

```sql
-- For rate limiting queries
CREATE INDEX idx_login_attempts_rate_limit
ON login_attempts(email, was_successful, attempted_at);

-- For enrollment queries
CREATE INDEX idx_enrollments_user
ON course_enrollments(user_id, enrolled_at);

CREATE INDEX idx_enrollments_course
ON course_enrollments(course_id, enrolled_at);
```

---

### 6.2 Query Optimization

**Common Query 1: Get User's Enrolled Courses**

```sql
SELECT c.*, ce.enrolled_at
FROM courses c
INNER JOIN course_enrollments ce ON c.id = ce.course_id
WHERE ce.user_id = ?
ORDER BY ce.enrolled_at DESC;

-- Uses indexes: course_enrollments(user_id), courses(id)
```

**Common Query 2: Get Courses with Enrollment Counts**

```sql
SELECT c.*, COUNT(ce.id) as enrolled_count
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
GROUP BY c.id;

-- Uses indexes: courses(id), course_enrollments(course_id)
```

**Common Query 3: Validate Auth Token**

```sql
SELECT u.*
FROM users u
INNER JOIN auth_tokens at ON u.id = at.user_id
WHERE at.token = ? AND at.expires_at > NOW();

-- Uses indexes: auth_tokens(token), auth_tokens(user_id)
```

**Common Query 4: Check Enrollment Capacity**

```sql
SELECT COUNT(*) as enrolled_count, c.capacity
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
WHERE c.id = ?
GROUP BY c.id;

-- Uses indexes: courses(id), course_enrollments(course_id)
```

---

### 6.3 Performance Considerations

**Scalability:**

- Current design supports up to 10,000 users
- Horizontal scaling possible via read replicas
- Consider partitioning `login_attempts` by date if high volume

**Caching Opportunities:**

- Course list with enrollment counts (cache for 5 minutes)
- User profile data (cache per session)
- Active token validation (cache in application memory)

**Maintenance Tasks:**

- **Daily:** Delete expired auth tokens
- **Weekly:** Archive old login attempts
- **Monthly:** Cleanup used password reset tokens
- **Quarterly:** Analyze and optimize slow queries

**Database Cleanup Queries:**

```sql
-- Delete expired auth tokens
DELETE FROM auth_tokens WHERE expires_at < NOW();

-- Delete old login attempts (keep 90 days)
DELETE FROM login_attempts
WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Delete used/expired password reset tokens
DELETE FROM password_reset_tokens
WHERE used = 1 OR expires_at < NOW();
```

---

## 7. Sample SQL Schema

### 7.1 Complete CREATE TABLE Statements

```sql
-- Table 1: Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    job_title VARCHAR(100) NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Courses
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NULL,
    instructor VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Course Enrollments (Junction Table)
CREATE TABLE course_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_enrolled_at (enrolled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: Authentication Tokens
CREATE TABLE auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: Login Attempts
CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    email VARCHAR(255) NOT NULL,
    was_successful BOOLEAN NOT NULL,
    attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_user (user_id),
    INDEX idx_attempted (attempted_at),
    INDEX idx_rate_limit (email, was_successful, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 6: Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at),
    INDEX idx_validation (token, used, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7.2 Sample Data Insertion

```sql
-- Insert sample users
INSERT INTO users (first_name, last_name, email, password_hash, job_title, role) VALUES
('Admin', 'User', 'admin@techcourses.com', '$2y$10$...', 'System Administrator', 'admin'),
('Sarah', 'Johnson', 'sarah@example.com', '$2y$10$...', 'Marketing Manager', 'user'),
('John', 'Smith', 'john@example.com', '$2y$10$...', 'Software Engineer', 'user');

-- Insert sample courses
INSERT INTO courses (title, short_description, full_description, instructor, duration, capacity) VALUES
('Advanced Web Development with React',
 'Learn modern web development using React, including hooks, state management, and API integration.',
 'This comprehensive course covers React fundamentals, advanced patterns, testing, and deployment.',
 'Dr. Jane Smith', '8 weeks', 30),
('Python for Beginners',
 'Start your programming journey with Python. Learn syntax, data structures, and problem-solving.',
 'Perfect for absolute beginners. No prior experience needed. Hands-on projects included.',
 'Prof. Michael Chen', '6 weeks', 50);

-- Insert sample enrollments
INSERT INTO course_enrollments (user_id, course_id) VALUES
(2, 1), -- Sarah in React course
(3, 1), -- John in React course
(2, 2); -- Sarah in Python course
```

---

## 8. ERD Creation Instructions

### For Visual ERD Tools

**Recommended Tools:**

- **Lucidchart** (web-based, templates available)
- **draw.io / diagrams.net** (free, open source)
- **dbdiagram.io** (text-to-diagram, fast)
- **MySQL Workbench** (auto-generates from database)
- **Microsoft Visio** (professional option)

**Steps to Create ERD:**

1. **Create Entity Boxes:**
   - Draw rectangle for each table (6 total)
   - Add table name in header
   - List all columns with data types
   - Mark primary keys with 🔑 or underline
   - Mark foreign keys with 🔗 or (FK) notation

2. **Add Relationships:**
   - Draw lines between related tables
   - Use crow's foot notation:
     - `│` = One (1)
     - `├──< ` = Many (\*)
     - `○` = Optional (0)
     - `│` = Mandatory (1)
   - Label relationship lines with verb phrases

3. **Show Cardinality:**
   - One-to-Many: `1 ──────< *`
   - Many-to-Many: `* >──────< *` (via junction table)
   - Label min/max: `(0,*)`, `(1,1)`, etc.

4. **Add Constraints:**
   - Unique constraints: UNIQUE symbol or text
   - Cascade behaviors: Note on relationship line
   - Check constraints: Annotation box

5. **Color Coding (Optional):**
   - Core entities (users, courses): Blue
   - Junction table (enrollments): Green
   - Support tables (tokens, attempts): Yellow
   - Highlight primary keys: Gold
   - Highlight foreign keys: Silver

6. **Add Legend:**
   - Explain symbols used
   - Define notation style (crow's foot, UML, etc.)
   - List any abbreviations

---

### dbdiagram.io Quick Syntax

```
Table users {
  id int [pk, increment]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  email varchar(255) [unique, not null]
  password_hash varchar(255) [not null]
  job_title varchar(100)
  role enum('user','admin') [not null, default: 'user']
  is_active boolean [not null, default: 1]
  created_at datetime [not null, default: `now()`]
  last_login datetime
}

Table courses {
  id int [pk, increment]
  title varchar(255) [not null]
  short_description text [not null]
  full_description text
  instructor varchar(100) [not null]
  duration varchar(50) [not null]
  capacity int [not null]
}

Table course_enrollments {
  id int [pk, increment]
  user_id int [not null, ref: > users.id]
  course_id int [not null, ref: > courses.id]
  enrolled_at datetime [not null, default: `now()`]

  indexes {
    (user_id, course_id) [unique]
  }
}

Table auth_tokens {
  id int [pk, increment]
  user_id int [not null, ref: > users.id]
  token varchar(64) [unique, not null]
  expires_at datetime [not null]
}

Table login_attempts {
  id int [pk, increment]
  user_id int [ref: > users.id]
  email varchar(255) [not null]
  was_successful boolean [not null]
  attempted_at datetime [not null, default: `now()`]
}

Table password_reset_tokens {
  id int [pk, increment]
  user_id int [not null, ref: > users.id]
  token varchar(64) [unique, not null]
  expires_at datetime [not null]
  used boolean [not null, default: 0]
}
```

Copy this into dbdiagram.io for instant visual ERD generation.

---

## Summary

**Total Entities:** 6 tables

1. users (core entity)
2. courses (core entity)
3. course_enrollments (junction table)
4. auth_tokens (security)
5. login_attempts (security/audit)
6. password_reset_tokens (security)

**Total Relationships:** 5 relationships

- 1 Many-to-Many (users ↔ courses)
- 4 One-to-Many (users → support tables)

**Key Features:**

- Normalized to 3NF
- Referential integrity via foreign keys
- Cascade and restrict deletes for data safety
- Comprehensive indexing for performance
- Security-focused token management
- Audit trail via timestamps

**Documentation Version:** 1.0  
**Last Updated:** January 2026  
**Created For:** WAD Portfolio Assignment - Task 1

---

**Next Steps:**

1. Use this specification to create visual ERD in chosen tool
2. Include all entities, attributes, and relationships
3. Show cardinality using crow's foot notation
4. Add annotations for constraints and business rules
5. Export as PDF or image for submission
