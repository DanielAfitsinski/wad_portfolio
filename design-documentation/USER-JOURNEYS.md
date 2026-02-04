# TechCourses4U - User Journey Storyboards

**Project:** Learning Management System (LMS)  
**Created:** January 2026  
**Purpose:** Assignment Task 1 - Storyboarding Key Application Functionality

---

## Table of Contents

1. [Journey 1: Standard User Login](#journey-1-standard-user-login)
2. [Journey 2: Password Reset Flow](#journey-2-password-reset-flow)
3. [Journey 3: Course Enrollment Process](#journey-3-course-enrollment-process)
4. [Journey 4: Admin User Management](#journey-4-admin-user-management)
5. [Journey 5: Admin Course Assignment](#journey-5-admin-course-assignment)

---

## Journey 1: Standard User Login

### Overview

**Actor:** Registered User (Sarah Johnson)  
**Goal:** Access personal dashboard to view enrolled courses  
**Success Criteria:** User successfully authenticated and viewing dashboard  
**Duration:** ~30 seconds (successful login), 5+ minutes (if account locked)

---

### Flow Diagram

```
START
  │
  ▼
┌────────────────────────┐
│  1. Login Screen       │ ← User navigates to / or clicks login link
│  (/)                   │
└────────────────────────┘
  │
  │ User Action: Enter email and password
  │ Input: "sarah@example.com" / "password123"
  ▼
┌────────────────────────┐
│  2. Form Validation    │
│  (Client-Side)         │
└────────────────────────┘
  │
  ├─── Invalid? ─────────> Show error: "Please enter valid email"
  │                        Stay on Login Screen
  │
  │ Valid format
  ▼
┌────────────────────────┐
│  3. Submit Login       │
│  POST /api/login/      │
│  login.php             │
└────────────────────────┘
  │
  │ Backend Process:
  │ • Fetch user by email
  │ • Check if user exists
  │ • Verify password hash
  │ • Check account active status
  │ • Check failed attempts (rate limiting)
  │
  ├─── User not found ───> Log attempt (was_successful=0)
  │                        Return error: "Invalid credentials"
  │                        Increment fail counter
  │                        ┌─── 3rd failed attempt? ───> Lock account for 5 min
  │                        │                              Show countdown timer
  │                        └─── <3 attempts ──> Allow retry
  │
  ├─── Wrong password ──> Same as "User not found"
  │
  ├─── Account inactive ─> Return error: "Account disabled"
  │
  │ ✓ Valid Credentials
  ▼
┌────────────────────────┐
│  4. Create Session     │
│  • Generate token      │
│  • Insert auth_tokens  │
│  • Set HTTP cookie     │
│  • Update last_login   │
│  • Log attempt (=1)    │
└────────────────────────┘
  │
  │ Response: { success: true, user: {...} }
  ▼
┌────────────────────────┐
│  5. Redirect to        │
│  Dashboard             │
│  (/dashboard)          │
└────────────────────────┘
  │
  │ Page Load:
  │ • Fetch user data
  │ • Fetch all courses
  │ • Fetch user enrollments
  ▼
┌────────────────────────┐
│  6. Display Dashboard  │
│  • Navbar with user    │
│  • Enrolled courses    │
│  • Available courses   │
└────────────────────────┘
  │
  ▼
SUCCESS - User is now authenticated and viewing personalized content
```

---

### Storyboard Frames

#### **Frame 1: Login Screen - Initial State**

**Screen:** Login (/)  
**Elements:**

- Empty email field (focused)
- Empty password field
- "Sign In" button (enabled)
- "Forgot Password?" link
- "Sign in with Google" button

**User Thought:** "I need to access my courses"

---

#### **Frame 2: User Enters Credentials**

**Screen:** Login (/)  
**Elements:**

- Email field: "sarah@example.com" (filled)
- Password field: "••••••••••" (masked, filled)
- Cursor on "Sign In" button

**User Action:** Types email and password, clicks "Sign In"

---

#### **Frame 3a: Success Path - Loading State**

**Screen:** Login (/)  
**Elements:**

- Button shows spinner: "Signing in..."
- Form fields disabled
- Loading overlay

**System Action:**

- POST request to backend
- Validate credentials
- Check rate limiting

---

#### **Frame 3b: Failure Path - Invalid Credentials**

**Screen:** Login (/)  
**Elements:**

- Red alert box: "Invalid email or password"
- Email field value retained
- Password field cleared
- Button re-enabled
- Subtle shake animation on form

**System Action:**

- Log failed attempt in `login_attempts` table
- Increment failure counter
- Check if >= 3 failures within 5 minutes

**User Thought:** "Oops, wrong password. Let me try again."

---

#### **Frame 3c: Failure Path - Account Locked**

**Screen:** Login (/)  
**Elements:**

- Red danger alert: "Account locked due to too many failed attempts. Try again in 4 minutes 32 seconds"
- Countdown timer updates every second
- Sign In button disabled (gray)
- Form fields disabled

**System Action:**

- Calculate time remaining until lockout expires
- Start client-side countdown timer
- Prevent login attempts

**User Thought:** "I'll wait or use 'Forgot Password' link"

---

#### **Frame 4: Success - Redirect Transition**

**Screen:** Transitioning  
**Elements:**

- Brief loading screen or smooth transition animation
- Brand logo centered
- Spinner

**System Action:**

- Auth token stored in HTTP-only cookie
- `last_login` timestamp updated
- React Router navigates to /dashboard

**Duration:** <500ms

---

#### **Frame 5: Dashboard - Loaded**

**Screen:** Dashboard (/dashboard)  
**Elements:**

- **Navbar:** "TechCourses4U | Sarah Johnson - Marketing Manager | [Logout]"
- **Enrolled Courses Section:**
  - 2 course cards showing enrolled courses
  - "Unenroll" buttons visible
- **Available Courses Section:**
  - 4 course cards
  - Mix of "Enroll" and "Enrolled" buttons
  - Capacity indicators

**User Thought:** "Great! I can see my enrolled courses and browse new ones."

**SUCCESS:** Journey complete

---

### Error Handling Scenarios

**Scenario A: Network Error**

- **Trigger:** Server unreachable
- **Display:** Red alert: "Network error. Please check your connection."
- **Recovery:** User can retry immediately

**Scenario B: Server Error (500)**

- **Trigger:** Backend exception
- **Display:** "Something went wrong. Please try again later."
- **Recovery:** User can retry or contact support

**Scenario C: Invalid Token During Session**

- **Trigger:** Token expired or deleted
- **Display:** Redirect to login with message: "Session expired. Please log in again."
- **Recovery:** User re-authenticates

---

## Journey 2: Password Reset Flow

### Overview

**Actor:** Registered User (John Smith) who forgot password  
**Goal:** Reset password and regain access to account  
**Success Criteria:** User sets new password and can log in  
**Duration:** ~3-5 minutes (includes email check)

---

### Flow Diagram

```
START - User cannot remember password
  │
  ▼
┌────────────────────────┐
│  1. Login Screen       │
│  (/)                   │
└────────────────────────┘
  │
  │ User Action: Click "Forgot Password?" link
  ▼
┌────────────────────────┐
│  2. Forgot Password    │
│  (/forgot-password)    │
└────────────────────────┘
  │
  │ User Action: Enter email address
  │ Input: "john@example.com"
  ▼
┌────────────────────────┐
│  3. Email Validation   │
│  (Real-time)           │
└────────────────────────┘
  │
  ├─── Invalid format ──> Show red border, X icon
  │                       Keep button disabled
  │
  │ ✓ Valid format (has @ and .)
  ▼
┌────────────────────────┐
│  4. Enable Button      │
│  • Green border        │
│  • Checkmark icon      │
│  • Button turns blue   │
└────────────────────────┘
  │
  │ User Action: Click "Send Reset Link"
  ▼
┌────────────────────────┐
│  5. Submit Request     │
│  POST /api/login/      │
│  forgot-password.php   │
└────────────────────────┘
  │
  │ Backend Process:
  │ • Check if email exists in users table
  │ • Generate random 64-char token
  │ • Insert into password_reset_tokens
  │   (token, user_id, expires_at = NOW() + 1 hour)
  │ • Send email with reset link
  │
  ├─── Email not found ──> Still show success message (security)
  │                        Don't reveal if email exists
  │
  │ ✓ Email found and sent
  ▼
┌────────────────────────┐
│  6. Success Message    │
│  "Reset link sent!"    │
│  "Check your email"    │
│  Auto-redirect in 3s   │
└────────────────────────┘
  │
  │ After 3 seconds
  ▼
┌────────────────────────┐
│  7. Back to Login      │
│  (/)                   │
└────────────────────────┘
  │
  │ User checks email inbox
  │ Subject: "Password Reset Request"
  │ Body: Contains link with token parameter
  ▼
┌────────────────────────┐
│  8. Email Received     │
│  Click reset link      │
│  /reset-password?      │
│  token=abc123...       │
└────────────────────────┘
  │
  │ Browser opens link
  ▼
┌────────────────────────┐
│  9. Reset Password     │
│  Screen Loads          │
│  (/reset-password)     │
└────────────────────────┘
  │
  │ On page load:
  │ • Extract token from URL
  │ • Validate token via backend
  │   GET /api/login/reset-password.php?token=...
  │
  ├─── Token invalid ────> Show error: "Invalid or expired reset link"
  │                        Disable form
  │                        Show "Request New Link" button
  │
  ├─── Token expired ───> Same as invalid
  │
  ├─── Token used ──────> Same as invalid
  │
  │ ✓ Token valid
  ▼
┌────────────────────────┐
│  10. Enable Form       │
│  • Show green check    │
│  • "Valid reset link"  │
│  • Enable input fields │
└────────────────────────┘
  │
  │ User Action: Enter new password twice
  │ Input: "newSecurePass123" (both fields)
  ▼
┌────────────────────────┐
│  11. Password          │
│  Validation            │
│  • Check length ≥6     │
│  • Check fields match  │
└────────────────────────┘
  │
  ├─── Too short ────────> Error: "Min 6 characters"
  │
  ├─── Don't match ─────> Error: "Passwords don't match"
  │                        Red border on confirm field
  │
  │ ✓ Valid and matching
  ▼
┌────────────────────────┐
│  12. Submit Reset      │
│  POST /api/login/      │
│  reset-password.php    │
└────────────────────────┘
  │
  │ Backend Process:
  │ • Validate token again (paranoid check)
  │ • Hash new password with bcrypt
  │ • UPDATE users SET password_hash = ?
  │ • UPDATE password_reset_tokens SET used = 1
  │ • Delete user's active auth_tokens (force re-login)
  │
  │ ✓ Success
  ▼
┌────────────────────────┐
│  13. Success Message   │
│  "Password reset!"     │
│  "Redirecting..."      │
│  Auto-redirect in 2s   │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│  14. Login Screen      │
│  (/)                   │
│  User can now log in   │
│  with new password     │
└────────────────────────┘
  │
  ▼
SUCCESS - Password successfully reset
```

---

### Storyboard Frames

#### **Frame 1: Forgot Password Screen - Empty**

**Screen:** Forgot Password (/forgot-password)  
**Elements:**

- "← Back to Login" link (top-left)
- "Reset Your Password" header
- Empty email field
- Helper text: "Check your inbox after submitting"
- "Send Reset Link" button (disabled, gray)

**User Thought:** "I need to enter my email to get a reset link"

---

#### **Frame 2: Email Entry with Validation**

**Screen:** Forgot Password  
**Elements:**

- Email field: "john@example.com" (filled)
- Green border around email field
- Green checkmark icon
- "Send Reset Link" button (enabled, blue)

**User Action:** Types email, sees real-time validation feedback

---

#### **Frame 3: After Submission - Success**

**Screen:** Forgot Password  
**Elements:**

- Green success alert: "✓ Reset link sent! Check your email for further instructions"
- Countdown: "Redirecting to login in 3... 2... 1..."
- Form slightly dimmed

**System Action:** Email sent with token link

---

#### **Frame 4: Email in Inbox**

**Screen:** Email Client  
**Elements:**

- **From:** TechCourses4U <noreply@techcourses.com>
- **Subject:** Password Reset Request
- **Body:**

  ```
  Hi John,

  We received a request to reset your password.
  Click the link below to create a new password:

  [Reset Password](https://techcourses.com/reset-password?token=abc123...)

  This link expires in 1 hour.
  If you didn't request this, ignore this email.
  ```

**User Action:** Clicks "Reset Password" link

---

#### **Frame 5: Reset Password Screen - Validating Token**

**Screen:** Reset Password (/reset-password?token=abc123...)  
**Elements:**

- "Create New Password" header
- Loading spinner
- Text: "⚙ Validating reset link..."
- Form fields disabled (grayed out)

**System Action:** Backend validates token

---

#### **Frame 6: Reset Password Screen - Valid Token**

**Screen:** Reset Password  
**Elements:**

- Green checkmark: "✓ Valid reset link"
- "New Password" field (empty, enabled)
- "Confirm Password" field (empty, enabled)
- Helper text: "Minimum 6 characters"
- "Reset Password" button (disabled until fields valid)

**User Thought:** "Now I can set my new password"

---

#### **Frame 7: Password Entry with Match Validation**

**Screen:** Reset Password  
**Elements:**

- "New Password" field: "••••••••••••" (12 chars, filled)
- "Confirm Password" field: "••••••••••••" (matching, filled)
- Green border on both fields (or checkmark)
- "Reset Password" button (enabled, blue)

**User Action:** Enters matching passwords

---

#### **Frame 8: Mismatched Password Error**

**Screen:** Reset Password  
**Alternative Path**  
**Elements:**

- "New Password": "newPassword123"
- "Confirm Password": "newPassword124" (different)
- Red border on confirm field
- Red X icon
- Error text: "✗ Passwords do not match"
- Button remains disabled

**User Thought:** "Oops, I mistyped. Let me fix that."

---

#### **Frame 9: Success - Password Reset**

**Screen:** Reset Password  
**Elements:**

- Large green success alert: "✓ Password successfully reset! Redirecting to login..."
- Countdown: "2 seconds"
- Form fields disabled

**System Action:**

- Password updated in database
- Token marked as used
- Old sessions invalidated

---

#### **Frame 10: Back to Login - Ready to Sign In**

**Screen:** Login (/)  
**Elements:**

- Standard login form
- Optional success message: "Password reset successful. Please log in with your new password."

**User Action:** Enters email and new password, successfully logs in

**SUCCESS:** Journey complete

---

### Security Considerations

**Email Enumeration Prevention:**

- System returns success message even if email doesn't exist
- Prevents attackers from discovering valid email addresses

**Token Security:**

- 64 random hexadecimal characters
- Cryptographically secure generation
- One-time use (marked as used after successful reset)
- 1-hour expiration

**Rate Limiting:**

- Limit password reset requests per email (e.g., 3 per hour)
- Prevents spam/abuse

---

## Journey 3: Course Enrollment Process

### Overview

**Actor:** Regular User (Sarah Johnson)  
**Goal:** Enroll in a new course from available offerings  
**Success Criteria:** Successfully enrolled, receives confirmation email, course appears in "Your Enrolled Courses"  
**Duration:** ~1 minute

---

### Flow Diagram

```
START - User on Dashboard, browsing available courses
  │
  ▼
┌────────────────────────┐
│  1. Dashboard          │
│  (/dashboard)          │
│  Viewing Available     │
│  Courses Section       │
└────────────────────────┘
  │
  │ User Action: Scroll through course cards
  │ Reads course descriptions, checks capacity
  ▼
┌────────────────────────┐
│  2. Course Selection   │
│  Found interesting     │
│  course:               │
│  "Data Science Basics" │
│  18/30 enrolled        │
│  12 spots remaining    │
└────────────────────────┘
  │
  │ User Action: Click "Show More" (if full description exists)
  ▼
┌────────────────────────┐
│  3. Expanded Course    │
│  View full description │
│  Prerequisites, topics │
│  Instructor details    │
└────────────────────────┘
  │
  │ User Decision: "This course looks good!"
  │ User Action: Click "Enroll" button
  ▼
┌────────────────────────┐
│  4. Enrollment Request │
│  POST /api/courses/    │
│  enroll.php            │
│  { user_id, course_id }│
└────────────────────────┘
  │
  │ Backend Validation:
  │ • Verify user is authenticated
  │ • Check user is active
  │ • Check if already enrolled
  │ • Check course capacity
  │ • Get course details
  │
  ├─── Already enrolled ─> Error: "You are already enrolled"
  │                         Button remains "Enrolled" (disabled)
  │
  ├─── Course full ──────> Error: "Course is full"
  │                         Button shows "Course Full"
  │
  ├─── User inactive ───> Error: "Account inactive"
  │
  │ ✓ All validations pass
  ▼
┌────────────────────────┐
│  5. Create Enrollment  │
│  INSERT INTO           │
│  course_enrollments    │
│  (user_id, course_id,  │
│   enrolled_at)         │
└────────────────────────┘
  │
  │ Database Transaction:
  │ • Insert enrollment record
  │ • Commit transaction
  ▼
┌────────────────────────┐
│  6. Send Email         │
│  Confirmation          │
│  (PHPMailer)           │
└────────────────────────┘
  │
  │ Email Details:
  │ To: sarah@example.com
  │ Subject: "Course Enrollment Confirmation - Data Science Basics"
  │ Body: Course details, enrollment date, next steps
  │
  │ ✓ Email sent successfully
  ▼
┌────────────────────────┐
│  7. Return Success     │
│  Response to Frontend  │
│  { success: true,      │
│    message: "...",     │
│    enrollment_id }     │
└────────────────────────┘
  │
  │ Frontend Actions:
  ▼
┌────────────────────────┐
│  8. Update UI          │
│  • Show success alert  │
│  • Refresh course data │
│  • Update both sections│
└────────────────────────┘
  │
  │ UI Changes:
  │ 1. Green success alert appears:
  │    "✓ Successfully enrolled in Data Science Basics!
  │     Check your email for confirmation."
  │
  │ 2. Course card updates:
  │    • "Enroll" button → "Enrolled" (disabled)
  │    • Enrollment count: 18/30 → 19/30
  │    • Progress bar updates
  │    • "12 spots remaining" → "11 spots remaining"
  │
  │ 3. Enrolled Courses section:
  │    • New course card appears at top
  │    • Shows enrollment date (today)
  │    • "Unenroll" button available
  ▼
┌────────────────────────┐
│  9. Dashboard Updated  │
│  • Enrolled Courses: 3 │
│    (was 2)             │
│  • New card visible    │
│  • Available Courses   │
│    reflects capacity   │
└────────────────────────┘
  │
  │ User checks email (within 1-2 minutes)
  ▼
┌────────────────────────┐
│  10. Email Received    │
│  Confirmation details  │
│  Course access info    │
└────────────────────────┘
  │
  ▼
SUCCESS - User enrolled and confirmed
```

---

### Storyboard Frames

#### **Frame 1: Available Courses - Browsing**

**Screen:** Dashboard - Available Courses Section  
**Elements:**

- Grid of 6 course cards
- Course "Data Science Basics":
  - Title and description visible
  - Instructor: "Prof. Michael Chen"
  - Duration: "10 weeks"
  - Progress bar: 60% full (green)
  - Badge: "18/30 students"
  - Text: "✓ 12 spots remaining"
  - "Show More ▼" link (blue)
  - "Enroll" button (blue, enabled)

**User Thought:** "Data Science looks interesting. Let me read more."

---

#### **Frame 2: Course Card Expanded**

**Screen:** Dashboard - Available Courses Section  
**Elements:**

- Same course card, now expanded
- Full description visible:
  ```
  "This course provides an introduction to data science fundamentals,
  including data analysis, visualization, and basic machine learning.
  Prerequisites: Basic Python knowledge. Hands-on projects included."
  ```
- "Show Less ▲" link
- All other elements same as Frame 1

**User Thought:** "Perfect! I have Python knowledge. I'll enroll."

---

#### **Frame 3: Button Click - Loading State**

**Screen:** Dashboard  
**Elements:**

- "Enroll" button changes:
  - Shows spinner icon
  - Text: "Enrolling..."
  - Disabled state (gray)
- Rest of card unchanged

**System Action:** POST request sent to backend

---

#### **Frame 4: Success - Alert Appears**

**Screen:** Dashboard  
**Elements:**

- Green success alert at top of page:
  ```
  ✓ Successfully enrolled in Data Science Basics!
  Check your email for confirmation details.
  ```
- Alert auto-dismisses after 5 seconds
- Page data refreshing (subtle loading indicators)

---

#### **Frame 5: UI Updated - Course Card**

**Screen:** Dashboard - Available Courses Section  
**Elements:**

- "Data Science Basics" card now shows:
  - "Enrolled" button (gray, disabled, checkmark icon)
  - Enrollment count: "19/30 students" (incremented)
  - Progress bar: slightly more filled
  - "✓ 11 spots remaining" (decremented)

**Visual Feedback:** Brief green flash/highlight animation on card

---

#### **Frame 6: Enrolled Courses Section Updated**

**Screen:** Dashboard - Your Enrolled Courses Section  
**Elements:**

- **New card appeared** at top (or sorted by enrollment date):
  - **Title:** "Data Science Basics"
  - **Instructor:** Prof. Michael Chen
  - **Duration:** 10 weeks
  - **Enrolled:** Jan 28, 2026 (today)
  - **Badge:** "19 students enrolled"
  - **"Unenroll" button** (red, enabled)
- Previous 2 enrolled courses below this one
- Total enrolled courses count: 3 (was 2)

**User Thought:** "Great! It's now in my enrolled courses."

---

#### **Frame 7: Email Confirmation**

**Screen:** Email Client (1-2 minutes later)  
**Elements:**

- **From:** TechCourses4U <noreply@techcourses.com>
- **Subject:** Course Enrollment Confirmation - Data Science Basics
- **Body:**

  ```
  Hi Sarah,

  You have successfully enrolled in:

  Course: Data Science Basics
  Instructor: Prof. Michael Chen
  Duration: 10 weeks
  Enrollment Date: January 28, 2026

  Access your course from your dashboard:
  https://techcourses.com/dashboard

  If you have questions, contact support@techcourses.com

  Happy learning!
  TechCourses4U Team
  ```

**User Thought:** "Perfect! Confirmation received."

**SUCCESS:** Enrollment journey complete

---

### Edge Cases & Variations

**Variation A: Course Fills Up During Enrollment**

- **Scenario:** User clicks "Enroll" but another user enrolled first, filling last spot
- **Frame:** Same as Frame 4, but error alert:
  ```
  ✗ Unable to enroll. This course is now full.
  ```
- **Card Update:** "Enroll" button → "Course Full" (disabled, red)

**Variation B: User Already Enrolled**

- **Scenario:** User clicks "Enroll" on course they're already in (shouldn't happen, but possible via multiple tabs)
- **Alert:** "✗ You are already enrolled in this course"
- **Card State:** No change, button remains "Enrolled"

**Variation C: Network Error**

- **Frame 3:** Button remains in loading state
- **After timeout (10s):** Error alert: "Network error. Please try again."
- **Recovery:** Button returns to "Enroll" state, user can retry

---

## Journey 4: Admin User Management

### Overview

**Actor:** Administrator (Admin User)  
**Goal:** Edit user details and manage user accounts  
**Success Criteria:** User information updated successfully  
**Duration:** ~2-3 minutes per user

---

### Flow Diagram

```
START - Admin logged in on Dashboard
  │
  ▼
┌────────────────────────┐
│  1. Dashboard          │
│  Navbar shows:         │
│  [Admin] [Logout]      │
└────────────────────────┘
  │
  │ User Action: Click "Admin" button in navbar
  ▼
┌────────────────────────┐
│  2. Admin Panel Modal  │
│  Opens (overlay)       │
└────────────────────────┘
  │
  │ Modal shows:
  │ • "Manage Users" button
  │ • "Add New Course" button
  │
  │ User Action: Click "Manage Users"
  ▼
┌────────────────────────┐
│  3. Manage Users Modal │
│  Opens (replaces Admin │
│  Panel)                │
└────────────────────────┘
  │
  │ On Load:
  │ • Fetch all users via GET /api/users/users.php
  │ • Display in data table
  ▼
┌────────────────────────┐
│  4. User Table Loaded  │
│  Shows all users       │
│  (15 rows)             │
└────────────────────────┘
  │
  │ Table displays:
  │ First Name | Last Name | Email | Job Title | Role | Active | Actions
  │ Sarah      | Johnson   | sarah@...| Manager  | User | ☑   | 🗑
  │ John       | Smith     | john@... | Engineer | User | ☑   | 🗑
  │ ...
  │
  │ User Action: Click on row (Sarah Johnson) to edit
  ▼
┌────────────────────────┐
│  5. Enter Edit Mode    │
│  Row transforms to     │
│  input fields          │
└────────────────────────┘
  │
  │ UI Changes:
  │ • Info alert appears: "Editing user: sarah@example.com"
  │ • Selected row fields become editable:
  │   - First Name: [input]
  │   - Last Name: [input]
  │   - Email: [input]
  │   - Job Title: [input]
  │   - Role: [dropdown: User/Admin]
  │   - Active: [checkbox]
  │ • Actions change to: 💾 Save | ✕ Cancel | 🗑 Delete
  │ • Other rows grayed out (disabled)
  │
  │ User Action: Change Job Title from "Manager" to "Senior Manager"
  │             Change Role from "User" to "Admin"
  ▼
┌────────────────────────┐
│  6. Fields Modified    │
│  Job Title: "Senior    │
│  Manager"              │
│  Role: "Admin"         │
└────────────────────────┘
  │
  │ User Action: Click 💾 Save icon
  ▼
┌────────────────────────┐
│  7. Submit Update      │
│  PUT /api/users/       │
│  users.php             │
│  { id, first_name,     │
│    last_name, email,   │
│    job_title, role,    │
│    is_active }         │
└────────────────────────┘
  │
  │ Backend Validation:
  │ • Verify all required fields present
  │ • Validate email format
  │ • Check email uniqueness (if changed)
  │ • Verify admin permissions
  │
  ├─── Validation fails ─> Error: "Invalid email format"
  │                         Stay in edit mode
  │
  │ ✓ Valid
  ▼
┌────────────────────────┐
│  8. Update Database    │
│  UPDATE users SET ...  │
│  WHERE id = ?          │
└────────────────────────┘
  │
  │ ✓ Database updated
  ▼
┌────────────────────────┐
│  9. Return Success     │
│  Response to frontend  │
└────────────────────────┘
  │
  │ Frontend Actions:
  │ • Exit edit mode
  │ • Update table row with new data
  │ • Remove info alert
  │ • Re-enable other rows
  │ • Show success toast: "User updated successfully"
  ▼
┌────────────────────────┐
│  10. Table Updated     │
│  Sarah | Johnson |     │
│  sarah@... |           │
│  Senior Manager |      │
│  Admin | ☑ | 🗑       │
└────────────────────────┘
  │
  │ Admin continues managing users OR
  │ User Action: Click "Close" to exit modal
  ▼
┌────────────────────────┐
│  11. Back to Dashboard │
│  If Sarah's role       │
│  changed to Admin,     │
│  she will see Admin    │
│  button on next login  │
└────────────────────────┘
  │
  ▼
SUCCESS - User updated
```

---

### Additional Admin Actions

#### **Action A: Delete User**

```
From: Manage Users Modal (Table View)
  │
  │ User Action: Click 🗑 Delete icon on row (John Smith)
  ▼
┌────────────────────────┐
│  Confirmation Dialog   │
│  "Delete User?"        │
│                        │
│  "Are you sure you     │
│  want to delete        │
│  John Smith?"          │
│                        │
│  "This will also       │
│  remove all their      │
│  course enrollments."  │
│                        │
│  [Cancel] [Delete]     │
└────────────────────────┘
  │
  ├─── Cancel ──────────> No action, dialog closes
  │
  │ User Action: Click "Delete" (red button)
  ▼
┌────────────────────────┐
│  Submit Delete Request │
│  DELETE /api/users/    │
│  users.php?id=5        │
└────────────────────────┘
  │
  │ Backend:
  │ • DELETE FROM course_enrollments WHERE user_id = 5 (cascade)
  │ • DELETE FROM auth_tokens WHERE user_id = 5 (cascade)
  │ • DELETE FROM users WHERE id = 5
  │
  │ ✓ User deleted
  ▼
┌────────────────────────┐
│  Frontend Updates      │
│  • Remove row from     │
│    table (fade out)    │
│  • Show success toast: │
│    "User deleted"      │
│  • Refresh dashboard   │
│    (course counts may  │
│     change)            │
└────────────────────────┘
  │
  ▼
SUCCESS - User deleted
```

---

#### **Action B: Add New User**

```
From: Manage Users Modal
  │
  │ User Action: Click "Add New User" button
  ▼
┌────────────────────────┐
│  Add User Modal Opens  │
│  (on top of Manage     │
│   Users Modal)         │
└────────────────────────┘
  │
  │ Form fields (all empty):
  │ • First Name *
  │ • Last Name *
  │ • Email *
  │ • Job Title *
  │ • Password * (min 6 chars)
  │ • Role (dropdown, default: User)
  │ • Active (checkbox, checked by default)
  │
  │ User Action: Fill form
  │ First Name: "Alice"
  │ Last Name: "Williams"
  │ Email: "alice@example.com"
  │ Job Title: "Data Analyst"
  │ Password: "securePass123"
  │ Role: User
  │ Active: ☑
  ▼
┌────────────────────────┐
│  Form Validation       │
│  • All required filled │
│  • Email format valid  │
│  • Password ≥6 chars   │
└────────────────────────┘
  │
  │ User Action: Click "Create User"
  ▼
┌────────────────────────┐
│  Submit Create Request │
│  POST /api/users/      │
│  users.php             │
└────────────────────────┘
  │
  │ Backend:
  │ • Validate data
  │ • Check email uniqueness
  │ • Hash password (bcrypt)
  │ • INSERT INTO users (...)
  │
  ├─── Email exists ────> Error: "Email already registered"
  │                        Stay in modal
  │
  │ ✓ User created
  ▼
┌────────────────────────┐
│  Success               │
│  • Show success alert  │
│  • Close Add User Modal│
│  • Refresh user table  │
│  • New row appears     │
└────────────────────────┘
  │
  ▼
SUCCESS - New user created
```

---

### Storyboard Frames

#### **Frame 1: Admin Panel Modal**

**Screen:** Admin Panel (modal overlay on dashboard)  
**Elements:**

- Modal header: "Admin Panel" (gradient background)
- Large "👥 Manage Users" button
- Large "➕ Add New Course" button
- "Close" button at bottom

**User Action:** Clicks "Manage Users"

---

#### **Frame 2: Manage Users Table - View Mode**

**Screen:** Manage Users Modal  
**Elements:**

- Modal header: "Manage Users"
- Data table with 15 users
- Columns: First, Last, Email, Job Title, Role, Active, Actions
- Rows are clickable (hover effect)
- Each row has 🗑 delete icon

**User Thought:** "I need to update Sarah's role to Admin"

---

#### **Frame 3: Edit Mode Active**

**Screen:** Manage Users Modal  
**Elements:**

- Blue info alert: "Editing user: sarah@example.com"
- Sarah's row transformed:
  - Input fields for text columns
  - Dropdown for Role (currently "User", can select "Admin")
  - Checkbox for Active (checked)
  - Actions: 💾 Save | ✕ Cancel | 🗑 Delete
- Other rows grayed out

**User Action:** Changes Role to "Admin", Job Title to "Senior Manager"

---

#### **Frame 4: After Save - Success**

**Screen:** Manage Users Modal  
**Elements:**

- Green success toast (top-right): "✓ User updated successfully"
- Sarah's row updated, showing new data:
  - Job Title: "Senior Manager"
  - Role: "Admin"
- Row exits edit mode, returns to normal view
- Other rows re-enabled

**SUCCESS:** User updated

---

## Journey 5: Admin Course Assignment

### Overview

**Actor:** Administrator  
**Goal:** Manually assign a user to a course  
**Success Criteria:** User enrolled in course without user-initiated action  
**Duration:** ~1 minute

---

### Flow Diagram

```
START - Admin wants to manually enroll user in course
  │
  ▼
┌────────────────────────┐
│  1. Dashboard          │
│  Admin browses courses │
└────────────────────────┘
  │
  │ User Action: Click "Edit" on specific course card
  │ Example: "React Fundamentals"
  ▼
┌────────────────────────┐
│  2. Edit Course Modal  │
│  Opens with 3 tabs     │
└────────────────────────┘
  │
  │ Tabs visible:
  │ • Details (active by default)
  │ • Assignments
  │ • Assign
  │
  │ User Action: Click "Assign" tab
  ▼
┌────────────────────────┐
│  3. Assign Tab Active  │
│  Manual assignment UI  │
└────────────────────────┘
  │
  │ Tab content:
  │ • Header: "➕ Manually Assign User to Course"
  │ • Info: "Bypass enrollment limits..."
  │ • "Select User" dropdown (empty)
  │ • "Assign User" button (disabled)
  │
  │ User Action: Click "Select User" dropdown
  ▼
┌────────────────────────┐
│  4. User Dropdown Open │
│  Fetches all users     │
│  GET /api/users/       │
│  users.php             │
└────────────────────────┘
  │
  │ Dropdown populated with:
  │ • Sarah Johnson - sarah@example.com
  │ • John Smith - john@example.com
  │ • Alice Williams - alice@example.com
  │ • ... (all users)
  │
  │ User Action: Select "Alice Williams"
  ▼
┌────────────────────────┐
│  5. User Selected      │
│  "Assign User" button  │
│  becomes enabled       │
└────────────────────────┘
  │
  │ User Action: Click "Assign User" button
  ▼
┌────────────────────────┐
│  6. Submit Assignment  │
│  POST /api/            │
│  user-courses.php      │
│  { user_id: 7,         │
│    course_id: 1 }      │
└────────────────────────┘
  │
  │ Backend Validation:
  │ • Verify admin permissions
  │ • Check if user already enrolled
  │ • Validate course exists
  │ • Check course capacity (admin can override)
  │
  ├─── Already enrolled ─> Error: "User already enrolled"
  │
  ├─── Course full ─────> Admin can choose:
  │                        • Proceed anyway (override)
  │                        • Cancel
  │
  │ ✓ Valid
  ▼
┌────────────────────────┐
│  7. Create Enrollment  │
│  INSERT INTO           │
│  course_enrollments    │
│  (user_id, course_id,  │
│   enrolled_at)         │
└────────────────────────┘
  │
  │ Note: Email NOT sent (admin assignment)
  │ ✓ Enrollment created
  ▼
┌────────────────────────┐
│  8. Return Success     │
│  Response to frontend  │
└────────────────────────┘
  │
  │ Frontend Updates:
  │ • Green success alert: "✓ User assigned successfully!"
  │ • Reset dropdown to placeholder
  │ • Switch to "Assignments" tab automatically
  │ • Show newly enrolled user in list
  ▼
┌────────────────────────┐
│  9. Assignments Tab    │
│  Shows updated list    │
│  Alice Williams now    │
│  appears in table      │
└────────────────────────┘
  │
  │ Table shows:
  │ Student Name    | Email        | Enrolled On
  │ Sarah Johnson   | sarah@...    | Jan 15
  │ John Smith      | john@...     | Jan 20
  │ Alice Williams  | alice@...    | Jan 28 (NEW)
  │
  │ Each row has "Unassign" button
  │
  │ Admin can:
  │ • Assign more users
  │ • Unassign users
  │ • Close modal
  ▼
┌────────────────────────┐
│  10. Dashboard Updated │
│  Course enrollment     │
│  count incremented     │
│  Alice sees course in  │
│  her enrolled list on  │
│  next login            │
└────────────────────────┘
  │
  ▼
SUCCESS - User manually assigned to course
```

---

### Storyboard Frames

#### **Frame 1: Edit Course Modal - Assign Tab**

**Screen:** Edit Course Modal - Assign Tab  
**Elements:**

- Tab header: "Assign" (active/underlined)
- Section header: "➕ Manually Assign User to Course"
- Helper text: "Bypass enrollment limits and manually add users"
- "Select User" dropdown (placeholder: "Select a user...")
- "Assign User" button (disabled, gray)

**User Thought:** "I need to add Alice to this React course"

---

#### **Frame 2: User Dropdown Opened**

**Screen:** Edit Course Modal - Assign Tab  
**Elements:**

- Dropdown expanded, showing list:
  ```
  Alice Williams - alice@example.com
  John Smith - john@example.com
  Sarah Johnson - sarah@example.com
  ...
  ```
- Search functionality (filter as you type)

**User Action:** Types "Alice" or scrolls, clicks "Alice Williams"

---

#### **Frame 3: User Selected - Button Enabled**

**Screen:** Edit Course Modal - Assign Tab  
**Elements:**

- Dropdown shows: "Alice Williams - alice@example.com" (selected)
- "Assign User" button (enabled, blue)

**User Action:** Clicks "Assign User"

---

#### **Frame 4: Assignment Processing**

**Screen:** Edit Course Modal - Assign Tab  
**Elements:**

- "Assign User" button shows spinner: "Assigning..."
- Dropdown disabled

**System Action:** Creating enrollment record

---

#### **Frame 5: Success - Auto-Switch Tab**

**Screen:** Edit Course Modal - Assignments Tab (auto-switched)  
**Elements:**

- Green success alert: "✓ User assigned successfully!"
- Assignments tab now active
- Table shows Alice Williams added:
  ```
  Alice Williams | alice@example.com | Jan 28, 2026 | [Unassign]
  ```
- New row highlighted briefly (green background fade)

**SUCCESS:** Manual assignment complete

---

#### **Frame 6: Unassign Option**

**Screen:** Edit Course Modal - Assignments Tab  
**Alternative Action**  
**Elements:**

- Admin clicks "Unassign" button next to Alice
- Confirmation dialog: "Remove Alice Williams from this course?"
- [Cancel] [Unassign] buttons

**If Unassign clicked:**

- Row removed from table
- Enrollment deleted from database
- Success message: "User unassigned from course"

---

## Summary of User Journeys

### Journey Comparison Matrix

| Journey                  | Actor        | Duration | Complexity | Key Interactions  | System Changes                                            |
| ------------------------ | ------------ | -------- | ---------- | ----------------- | --------------------------------------------------------- |
| **1. Login**             | Regular User | 30 sec   | Low        | 2 screens         | Creates auth token, updates last_login                    |
| **2. Password Reset**    | Regular User | 3-5 min  | Medium     | 4 screens + email | Creates reset token, updates password, invalidates tokens |
| **3. Course Enrollment** | Regular User | 1 min    | Low        | 1 screen          | Creates enrollment, sends email, updates counts           |
| **4. User Management**   | Admin        | 2-3 min  | Medium     | 2 modals          | Updates user data, affects permissions                    |
| **5. Course Assignment** | Admin        | 1 min    | Medium     | 2 modals          | Creates enrollment without user action                    |

---

### Common Patterns Across Journeys

**Success Patterns:**

1. Clear visual feedback (alerts, toasts, color changes)
2. Loading states during async operations
3. Automatic data refresh after mutations
4. Success messages with actionable next steps
5. Smooth transitions between states

**Error Handling Patterns:**

1. Validation errors shown inline (red borders, error text)
2. Server errors shown as alert banners
3. Network errors allow retry
4. User-friendly error messages (no technical jargon)
5. State rollback on failure

**Security Patterns:**

1. Token-based authentication on all protected routes
2. Role-based access (admin checks)
3. Rate limiting on sensitive operations
4. Email confirmations for important actions
5. Confirmation dialogs for destructive actions

---

## Creating Visual Storyboards

### Recommended Approach

**1. Tool Selection:**

- **Figma/Adobe XD:** Interactive prototypes with transitions
- **PowerPoint/Keynote:** Simple slide-based storyboards
- **Miro/Mural:** Collaborative whiteboarding
- **Hand-drawn:** Sketches with annotations (quick and effective)

**2. Storyboard Format:**
Each frame should include:

- **Frame number** (e.g., "Frame 3a")
- **Screen title** (e.g., "Login Screen")
- **Visual mockup** (wireframe or screenshot)
- **Annotations:**
  - User actions (in blue)
  - System actions (in green)
  - User thoughts (in speech bubbles)
  - Data/state changes (in orange)
- **Transitions** (arrows showing flow to next frame)

**3. Journey Flow Format:**

- **Start state:** Green box
- **Decision points:** Diamond shapes
- **Actions:** Rectangles
- **End state:** Red box (error) or Green box (success)
- **Alternative paths:** Dotted lines

---

## Next Steps for Assignment Submission

1. **Create Visual Storyboards:**
   - Use this document as your detailed reference
   - Create 5-8 visual frames per journey
   - Add screenshots or wireframes from your application
   - Annotate with arrows, callouts, and notes

2. **Organize Presentation:**
   - One journey per page/section
   - Show happy path and at least one error path
   - Include timing estimates
   - Highlight key functionality demonstrated

3. **Export for Submission:**
   - PDF format recommended
   - High-resolution images
   - Clear, readable text
   - Professional layout

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Created For:** WAD Portfolio Assignment - Task 1
