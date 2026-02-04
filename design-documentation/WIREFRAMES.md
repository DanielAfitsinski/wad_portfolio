# TechCourses4U - Annotated Wireframe Specifications

**Project:** Learning Management System (LMS)  
**Created:** January 2026  
**Purpose:** Assignment Task 1 - Design Documentation

---

## Table of Contents

1. [Authentication Screens](#1-authentication-screens)
2. [Main Application Screens](#2-main-application-screens)
3. [Course Display Components](#3-course-display-components)
4. [Admin Screens & Modals](#4-admin-screens--modals)
5. [Responsive Breakpoints](#5-responsive-breakpoints)

---

## 1. Authentication Screens

### 1.1 Login Screen (Route: `/`)

**Layout:** Centered card on full-screen background

#### UI Elements:

```
┌─────────────────────────────────────────────┐
│                                             │
│              [LOGO/BRAND]                   │
│           TechCourses4U Login               │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Email Address                        │ │
│  │  [input field]                        │ │
│  │  ✓ Required                           │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Password                             │ │
│  │  [input field - password type]        │ │
│  │  ✓ Required (min 6 characters)        │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [🔗 Forgot Password?] (link, right-aligned)│
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │        [Sign In] Button               │ │
│  │     (Primary, full width)             │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ─────────── OR ───────────                │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  [G] Sign in with Google              │ │
│  │     (Secondary, full width)           │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Alert Box - Conditional Display]         │
│  ⚠ Account locked. Try again in X minutes  │
│                                             │
└─────────────────────────────────────────────┘
```

#### Annotations:

**1. Email Input Field**

- Type: text/email
- Validation: Required, email format
- Error state: Red border if invalid
- Autofocus on page load

**2. Password Input Field**

- Type: password (hidden characters)
- Validation: Required, minimum 6 characters
- Error state: Red border if invalid

**3. Forgot Password Link**

- Action: Navigate to `/forgot-password`
- Styling: Text link, right-aligned below password field

**4. Sign In Button**

- Action: Submit login form
- States:
  - **Normal:** Blue background, white text
  - **Disabled:** Gray background (when account locked)
  - **Loading:** Shows spinner, text "Signing in..."
  - **Error:** Shake animation on failure

**5. Google OAuth Button**

- Action: Opens Google OAuth popup
- Icon: Google "G" logo
- Styling: White background, gray border, full width

**6. Account Lockout Alert**

- Visibility: Only shown when user has 3+ failed attempts within 5 minutes
- Content: "Account locked. Try again in X minutes Y seconds"
- Styling: Red/danger alert banner
- Updates: Real-time countdown timer
- Auto-dismiss: When lockout expires

#### Interactive States:

**Success Flow:**

1. User enters valid credentials
2. Button shows loading spinner
3. Redirect to `/dashboard`
4. Auth token stored in HTTP-only cookie

**Failure Flow:**

1. User enters invalid credentials
2. Error alert appears: "Invalid email or password"
3. Failed attempt counter increments
4. After 3rd failure: Account locked for 5 minutes
5. Lockout alert appears with countdown

**First-Time Load:**

- Check for existing auth token
- If valid token exists: Auto-redirect to dashboard
- If invalid/expired: Show login form

#### Responsive Behavior:

- **Desktop (≥992px):** Card width 450px, centered
- **Tablet (768-991px):** Card width 90%, max 500px
- **Mobile (<768px):** Full width with 16px padding

---

### 1.2 Forgot Password Screen (Route: `/forgot-password`)

**Layout:** Centered card, similar to login

#### UI Elements:

```
┌─────────────────────────────────────────────┐
│                                             │
│              [← Back to Login]              │
│                                             │
│           Reset Your Password               │
│   Enter your email to receive a reset link │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Email Address                        │ │
│  │  [input field]                        │ │
│  │  ✓ Real-time validation               │ │
│  │  [Border: Green ✓ / Red ✗]           │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ✉ Check your inbox after submitting       │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │      [Send Reset Link] Button         │ │
│  │     (Disabled until valid email)      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Success Alert - Conditional]             │
│  ✓ Reset link sent! Check your email       │
│                                             │
└─────────────────────────────────────────────┘
```

#### Annotations:

**1. Back to Login Link**

- Action: Navigate to `/` (Login screen)
- Icon: Left arrow (←)
- Position: Top-left of card

**2. Email Input with Real-Time Validation**

- Type: email
- Validation: Triggers on blur or after 500ms typing pause
- Visual Feedback:
  - **Valid email:** Green border, checkmark icon
  - **Invalid email:** Red border, X icon
  - **Empty:** Neutral gray border

**3. Helper Text**

- Content: "Check your inbox after submitting"
- Icon: Envelope (✉)
- Styling: Small, muted gray text

**4. Send Reset Link Button**

- State Management:
  - **Disabled:** Gray, until email is valid format
  - **Enabled:** Blue, clickable
  - **Loading:** Shows spinner, "Sending..."
  - **Success:** Green momentarily, then auto-redirect

**5. Success Alert**

- Visibility: Only after successful submission
- Content: "Reset link sent! Check your email for further instructions"
- Styling: Green/success alert banner
- Auto-Action: Redirect to login after 3 seconds

#### Interactive Flow:

**Success Path:**

1. User enters email → real-time validation → green border
2. Button becomes enabled
3. User clicks "Send Reset Link"
4. System checks if email exists in database
5. If exists: Generates token, sends email, shows success
6. If not exists: Still shows success (security: don't reveal if email exists)
7. Auto-redirect to login after 3 seconds

**Validation States:**

- Empty field: Neutral state
- Typing: Wait 500ms after last keystroke
- Valid format (contains @ and .): Green border, enable button
- Invalid format: Red border, keep button disabled

---

### 1.3 Reset Password Screen (Route: `/reset-password?token=XXX`)

**Layout:** Centered card

#### UI Elements:

```
┌─────────────────────────────────────────────┐
│                                             │
│            Create New Password              │
│                                             │
│  [Token Validation Status]                  │
│  ⚙ Validating reset link...                │
│  OR                                         │
│  ✓ Valid reset link                         │
│  OR                                         │
│  ✗ Invalid or expired reset link            │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  New Password                         │ │
│  │  [input field - password type]        │ │
│  │  ✓ Minimum 6 characters               │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Confirm Password                     │ │
│  │  [input field - password type]        │ │
│  │  [Match indicator]                    │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │      [Reset Password] Button          │ │
│  │   (Disabled until passwords match)    │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Error Alert - Conditional]               │
│  ✗ Passwords do not match                  │
│                                             │
└─────────────────────────────────────────────┘
```

#### Annotations:

**1. Token Validation Indicator**

- **On Page Load:** Shows spinner with "Validating reset link..."
- **If Token Valid:** Shows green checkmark, form becomes enabled
- **If Token Invalid:** Shows red X, error message, disable form, show "Request New Link" button
- Token checked via: URL parameter `?token=XXX`

**2. New Password Field**

- Type: password
- Validation:
  - Required
  - Minimum 6 characters
- Visual indicator: Character count below field (optional)

**3. Confirm Password Field**

- Type: password
- Validation: Must match "New Password" field exactly
- Real-time matching:
  - **Match:** Green border or checkmark
  - **No Match:** Red border or X icon
  - **Empty:** Neutral

**4. Reset Password Button**

- Enabled State:
  - Token is valid
  - New password ≥ 6 characters
  - Passwords match
- States:
  - **Disabled:** Gray
  - **Enabled:** Blue
  - **Loading:** Spinner, "Resetting..."
  - **Success:** Green, "Password Reset!"

**5. Error/Success Alerts**

- **Passwords Don't Match:** Red alert, shown real-time
- **Token Expired:** Red alert, "This reset link has expired. Request a new one."
- **Success:** Green alert, "Password successfully reset! Redirecting to login..."

#### Interactive Flow:

**Page Load:**

1. Extract token from URL query parameter
2. Send token to backend for validation
3. If valid: Enable form, show success indicator
4. If invalid/expired: Show error, disable form, offer "Back to Login" button

**Password Reset:**

1. User enters new password (≥6 chars)
2. User enters confirm password
3. Real-time validation: Check if passwords match
4. Button enables when all validations pass
5. User clicks "Reset Password"
6. Backend validates token again and updates password
7. Success: Show confirmation, redirect to login after 2 seconds
8. Failure: Show error message

---

## 2. Main Application Screens

### 2.1 Dashboard (Route: `/dashboard`)

**Layout:** Full-page application with navbar and scrollable content

#### Overall Structure:

```
┌───────────────────────────────────────────────────┐
│ NAVBAR (Fixed Top)                                │
│ [TechCourses4U] [User: John Doe - Developer]      │
│                              [Admin] [Logout]     │
└───────────────────────────────────────────────────┘
│                                                   │
│  CONTENT AREA (Scrollable)                       │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  YOUR ENROLLED COURSES (Section Header)     │ │
│  ├─────────────────────────────────────────────┤ │
│  │  [Grid of Enrolled Course Cards]            │ │
│  │  (Up to 3 columns on desktop)               │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  AVAILABLE COURSES (Section Header)         │ │
│  ├─────────────────────────────────────────────┤ │
│  │  [Grid of Available Course Cards]           │ │
│  │  (Up to 3 columns on desktop)               │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
└───────────────────────────────────────────────────┘
```

#### Annotations:

**Page Lifecycle:**

1. **On Mount:**
   - Verify authentication (check auth token)
   - Fetch user profile data
   - Fetch all courses with enrollment counts
   - Fetch user's enrollments
   - Display loading spinner during data fetch

2. **Data Refresh Triggers:**
   - After enrolling in course
   - After unenrolling from course
   - After admin edits course
   - After returning from admin panel

**Loading States:**

- Full-page spinner on initial load
- Skeleton cards while courses loading
- Individual button spinners during enroll/unenroll actions

**Empty States:**

- **No Enrolled Courses:** "You haven't enrolled in any courses yet. Browse available courses below!"
- **No Available Courses:** "No courses available at this time. Check back soon!"

**Error States:**

- Network error: "Unable to load courses. Please refresh the page."
- Auth error: Redirect to login
- Action error: Alert banner with specific error message

---

### 2.2 Navbar Component

**Layout:** Fixed top bar, full width

#### UI Elements:

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] TechCourses4U    John Doe - Software Developer  │
│                                        [Admin] [Logout]  │
└─────────────────────────────────────────────────────────┘
```

#### Detailed Breakdown:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [📚 ICON] TechCourses4U                               │
│  (Brand, left-aligned)                                 │
│                                                         │
│              [User Info Display - Center/Right]         │
│              First Name + Last Name + " - " + Job Title │
│              Example: "Sarah Johnson - Marketing Manager"│
│                                                         │
│                                    [Admin Button]       │
│                                    (If role = 'admin')  │
│                                                         │
│                                    [Logout Button]      │
│                                    (All users)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Annotations:

**1. Brand/Logo Section**

- Content: "TechCourses4U" text (or logo image)
- Position: Left side of navbar
- Font: Bold, larger size
- Color: Primary brand color
- Clickable: No action (already on dashboard)

**2. User Information Display**

- Content: `{firstName} {lastName} - {jobTitle}`
- Position: Center or right-center
- Styling: Regular weight, medium size
- Source: User data from auth context
- Examples:
  - "John Smith - Software Engineer"
  - "Admin User - System Administrator"

**3. Admin Button**

- Visibility: Only when `user.role === 'admin'`
- Label: "Admin"
- Icon: ⚙ (gear/settings icon)
- Action: Opens Admin Panel modal
- Styling: Secondary button style (outline)

**4. Logout Button**

- Visibility: Always shown for authenticated users
- Label: "Logout"
- Icon: 🚪 (door/exit icon)
- Action:
  1. Sends logout request to backend
  2. Deletes auth token from database
  3. Clears auth cookie
  4. Redirects to login page
- Styling: Danger/red button

**Responsive Behavior:**

- **Desktop (≥992px):** All elements in one row
- **Tablet (768-991px):** User info abbreviated to just name
- **Mobile (<768px):**
  - Stack elements
  - Brand on left
  - Buttons on right (icons only)
  - User info in dropdown or second row

---

## 3. Course Display Components

### 3.1 Enrolled Courses Section

**Layout:** Section within dashboard, full width

#### UI Elements:

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  YOUR ENROLLED COURSES                                │
│  (Section Header - H2, bold)                          │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Course 1   │  │  Course 2   │  │  Course 3   │  │
│  │  (Card)     │  │  (Card)     │  │  (Card)     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                       │
│  [OR - If no enrollments]                             │
│                                                       │
│  📚 You haven't enrolled in any courses yet.          │
│  Browse available courses below!                      │
│  (Empty state message)                                │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### Annotations:

**Section Header:**

- Text: "Your Enrolled Courses"
- Styling: H2, bold, dark text
- Spacing: 20px margin bottom

**Course Card Grid:**

- Layout: CSS Grid or Flexbox
- Columns:
  - Desktop (≥992px): 3 columns
  - Tablet (768-991px): 2 columns
  - Mobile (<768px): 1 column
- Gap: 20px between cards
- Cards: Use EnrolledCourseCard component (see 3.2)

**Empty State:**

- Icon: 📚 book emoji or SVG icon
- Message: Two-line friendly message
- Styling: Centered, muted gray text
- Visibility: Only when `enrolledCourses.length === 0`

---

### 3.2 Enrolled Course Card Component

**Layout:** Card with course details and unenroll action

#### UI Elements:

```
┌─────────────────────────────────────────┐
│  [Course Title]                         │
│  (H5, bold, truncate if too long)       │
│                                         │
│  👤 Instructor: Dr. Jane Smith          │
│  ⏱ Duration: 8 weeks                    │
│  📅 Enrolled: Jan 15, 2026              │
│                                         │
│  [Badge: 24 students enrolled]          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    [Unenroll] Button            │   │
│  │    (Danger/Red, full width)     │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### Detailed Annotations:

**1. Course Title**

- Source: `course.title`
- Styling: H5, bold, primary dark color
- Truncation: Max 2 lines, ellipsis if longer
- Example: "Advanced Web Development with React"

**2. Instructor Line**

- Icon: 👤 or teacher icon
- Label: "Instructor: "
- Content: `course.instructor`
- Example: "Instructor: Dr. Jane Smith"

**3. Duration Line**

- Icon: ⏱ or clock icon
- Label: "Duration: "
- Content: `course.duration`
- Example: "Duration: 8 weeks"

**4. Enrollment Date Line**

- Icon: 📅 or calendar icon
- Label: "Enrolled: "
- Content: Formatted enrollment date from `enrollment.enrolled_at`
- Format: "MMM DD, YYYY" (e.g., "Jan 15, 2026")

**5. Enrollment Count Badge**

- Content: `{course.enrolled_count} students enrolled`
- Styling: Small badge, info color (blue), rounded
- Position: Above unenroll button

**6. Unenroll Button**

- Label: "Unenroll"
- Styling: Danger/red button, full width
- Icon: ✕ or minus icon (optional)
- Action:
  1. Show confirmation dialog: "Are you sure you want to unenroll?"
  2. If confirmed: Send DELETE request
  3. On success: Remove card from display, refresh available courses
  4. On error: Show error alert
- States:
  - **Normal:** Red background, white text
  - **Hover:** Darker red
  - **Loading:** Spinner, "Unenrolling..."

**Card Styling:**

- Border: 1px solid light gray
- Border radius: 8px
- Padding: 20px
- Box shadow: Subtle shadow on hover
- Background: White
- Transition: Smooth hover effect

---

### 3.3 Available Courses Section

**Layout:** Section within dashboard, below enrolled courses

#### UI Elements:

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  AVAILABLE COURSES                                    │
│  (Section Header - H2, bold)                          │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Course 1   │  │  Course 2   │  │  Course 3   │  │
│  │  (Card)     │  │  (Card)     │  │  (Card)     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Course 4   │  │  Course 5   │  │  Course 6   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                       │
│  [Pagination or "Load More" - if needed]             │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### Annotations:

**Section Header:**

- Text: "Available Courses"
- Styling: H2, bold, dark text
- Spacing: 40px margin top, 20px margin bottom

**Course Card Grid:**

- Layout: Same as Enrolled Courses Section
- Columns: 3/2/1 based on screen size
- Gap: 20px
- Cards: Use CourseCard component (see 3.4)

**Filtering/Display Logic:**

- Shows ALL courses from database
- Visual distinction for:
  - Courses user is enrolled in (button shows "Enrolled", disabled)
  - Courses at capacity (button shows "Course Full", disabled)
  - Courses available for enrollment (button shows "Enroll", enabled)

**Admin-Specific Features:**

- Each card shows "Edit" button for admin users
- Edit button opens Edit Course Modal

---

### 3.4 Course Card Component (Available Courses)

**Layout:** Detailed card with enrollment capability

#### UI Elements:

```
┌─────────────────────────────────────────────────┐
│  [Course Title]                                 │
│  (H5, bold, primary color)                      │
│                                                 │
│  [Short Description]                            │
│  (2-3 lines, muted text)                        │
│                                                 │
│  [Show More ▼] (if full description exists)     │
│                                                 │
│  ─────────────────────────────                  │
│  [Full Description - Expandable]                │
│  (Shown when "Show More" clicked)               │
│  ─────────────────────────────                  │
│                                                 │
│  👤 Instructor: Dr. Sarah Lee                   │
│  ⏱ Duration: 10 weeks                           │
│                                                 │
│  [Progress Bar]                                 │
│  ████████░░ 18/30 students                      │
│  (Green if <80% full, Red if ≥80% full)         │
│                                                 │
│  ✓ 12 spots remaining                           │
│  (OR: ⚠ Only 3 spots left!)                     │
│  (OR: ✗ Course Full)                            │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │     [Enroll] Button                   │     │
│  │     (Primary, full width)             │     │
│  └───────────────────────────────────────┘     │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │     [Edit] Button (Admin only)        │     │
│  │     (Secondary, full width)           │     │
│  └───────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Detailed Annotations:

**1. Course Title**

- Source: `course.title`
- Styling: H5, bold, primary color
- Example: "Introduction to Python Programming"

**2. Short Description**

- Source: `course.short_description`
- Purpose: Quick overview shown on card
- Styling: Regular text, muted gray
- Length: Optimally 2-3 lines, max 150 characters
- Example: "Learn the fundamentals of Python programming, from basic syntax to data structures and object-oriented programming."

**3. Show More / Show Less Toggle**

- Visibility: Only if `course.full_description` exists and is not empty
- Label:
  - Collapsed: "Show More ▼"
  - Expanded: "Show Less ▲"
- Action: Toggle visibility of full description section
- Styling: Link/button, primary color

**4. Full Description (Expandable)**

- Source: `course.full_description`
- Visibility: Hidden by default, shown when "Show More" clicked
- Styling: Regular text, slightly smaller font
- Border: Top and bottom divider lines
- Animation: Smooth expand/collapse transition

**5. Instructor & Duration**

- Same format as Enrolled Course Card
- Icons and labels for clarity

**6. Enrollment Progress Bar**

- Visual Element: Horizontal bar graph
- Calculation: `(enrolled_count / capacity) * 100`
- Color Logic:
  - **0-79% full:** Green/success color
  - **80-99% full:** Yellow/warning color
  - **100% full:** Red/danger color
- Label: "{enrolled_count}/{capacity} students"

**7. Spots Remaining Indicator**

- Calculation: `capacity - enrolled_count`
- States:
  - **Many spots (>10%):** "✓ {remaining} spots remaining" (green text)
  - **Few spots (1-10%):** "⚠ Only {remaining} spots left!" (orange text)
  - **Full (0 spots):** "✗ Course Full" (red text, bold)

**8. Enroll Button**

- Label: Changes based on state
  - **Available:** "Enroll"
  - **Already Enrolled:** "Enrolled"
  - **Course Full:** "Course Full"
- Enabled State:
  - User NOT enrolled AND course has capacity
- Disabled State:
  - User already enrolled OR course at capacity
- Action:
  1. Click "Enroll"
  2. Send POST request with user_id and course_id
  3. Backend validates capacity
  4. Creates enrollment record
  5. Sends confirmation email
  6. Frontend updates:
     - Refresh both sections
     - Show success alert
     - Button changes to "Enrolled" (disabled)
     - Progress bar updates
- States:
  - **Normal:** Primary blue button
  - **Hover:** Darker blue
  - **Loading:** Spinner, "Enrolling..."
  - **Disabled:** Gray button
  - **Success:** Green flash, then changes to "Enrolled"

**9. Edit Button (Admin Only)**

- Visibility: Only when `user.role === 'admin'`
- Label: "Edit"
- Icon: ✏ pencil icon
- Action: Opens Edit Course Modal with this course's data
- Styling: Secondary/outline button
- Position: Below Enroll button

**Card Styling:**

- Border: 1px solid light gray
- Border radius: 8px
- Padding: 24px
- Box shadow: Subtle shadow, stronger on hover
- Background: White
- Min-height: Ensure consistent height across grid

---

## 4. Admin Screens & Modals

### 4.1 Admin Panel Modal

**Trigger:** Click "Admin" button in navbar  
**Type:** Bootstrap modal, centered overlay

#### UI Elements:

```
┌─────────────────────────────────────────┐
│  Admin Panel                      [✕]   │
│  (Modal Header, gradient background)    │
├─────────────────────────────────────────┤
│                                         │
│  Central hub for administrative tasks   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │      👥 Manage Users              │ │
│  │                                   │ │
│  │  View, edit, and delete users     │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│            [Button]                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │      ➕ Add New Course            │ │
│  │                                   │ │
│  │  Create a new course offering     │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│            [Button]                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │         [Close] Button            │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

#### Annotations:

**Modal Configuration:**

- Size: Medium (500px width)
- Position: Centered on screen
- Backdrop: Semi-transparent dark overlay
- Close Methods:
  - Click ✕ in header
  - Click "Close" button
  - Click outside modal (backdrop)
  - Press ESC key

**Header:**

- Text: "Admin Panel"
- Styling: Bold, white text on gradient background (blue-purple)
- Close icon: ✕ top-right corner

**1. Manage Users Button**

- Icon: 👥 (group of people)
- Primary Text: "Manage Users"
- Subtext: "View, edit, and delete users"
- Action: Opens Manage Users Modal, closes Admin Panel
- Styling: Large card-like button, full width, hover effect

**2. Add New Course Button**

- Icon: ➕ (plus sign)
- Primary Text: "Add New Course"
- Subtext: "Create a new course offering"
- Action: Opens Add Course Modal, closes Admin Panel
- Styling: Large card-like button, full width, hover effect

**3. Close Button**

- Label: "Close"
- Action: Dismiss modal
- Styling: Secondary/gray button

**Navigation Flow:**

- This modal acts as a hub
- Each action opens a specific admin modal
- Original Admin Panel closes when sub-modal opens
- User can return by closing sub-modal

---

### 4.2 Manage Users Modal

**Trigger:** Click "Manage Users" in Admin Panel  
**Type:** Large modal with data table

#### UI Elements:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Manage Users                                                 [✕]   │
│  (Modal Header, gradient background)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [ℹ Info Alert - when in edit mode]                                │
│  Editing user: sarah@example.com - Click Save or Cancel             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [Data Table]                                               │   │
│  │                                                             │   │
│  │  First    Last     Email           Job Title   Role  Active│   │
│  │  Name     Name                                              │   │
│  │  ────────────────────────────────────────────────────────  │   │
│  │  [Edit Row - Input Fields when editing]                    │   │
│  │  ────────────────────────────────────────────────────────  │   │
│  │  Sarah    Johnson  sarah@ex...    Manager    [▼]   [☑]    │   │
│  │  (Click row to edit)                         User  Active  │   │
│  │                                             Admin           │   │
│  │                                                   Actions:  │   │
│  │                                            [💾] [✕] [🗑]   │   │
│  │  ────────────────────────────────────────────────────────  │   │
│  │  John     Smith    john@ex...     Engineer   User   [☑]    │   │
│  │  ────────────────────────────────────────────────────────  │   │
│  │  (More rows...)                                             │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Add New User] Button                                              │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │  [Close] Button       │                                         │
│  └───────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Detailed Annotations:

**Table Structure:**

- **Scrollable:** Vertical scroll if many users
- **Columns:**
  1. First Name (text)
  2. Last Name (text)
  3. Email (text, truncated if long)
  4. Job Title (text)
  5. Role (dropdown: User/Admin)
  6. Active (checkbox: checked=active, unchecked=inactive)
  7. Actions (Edit, Delete icons)

**View Mode (Default):**

- Each row displays user data as text
- Click anywhere on row: Enters edit mode for that row
- Hover effect: Light background color change
- Actions column shows:
  - 🗑 Delete icon (red, trash can)

**Edit Mode:**

- Triggered by clicking row
- Info alert appears at top: "Editing user: {email}"
- Selected row transforms:
  - First Name: Input field
  - Last Name: Input field
  - Email: Input field (validated)
  - Job Title: Input field
  - Role: Dropdown (User, Admin)
  - Active: Checkbox toggle
- Actions column shows:
  - 💾 Save icon (green, disk)
  - ✕ Cancel icon (gray, X)
- Only one row editable at a time
- Other rows disabled/grayed out

**Edit Actions:**

**Save:**

1. Click save icon
2. Validate all fields (required, email format)
3. Send PUT request with updated user data
4. On success:
   - Update table row with new data
   - Exit edit mode
   - Show success alert: "User updated successfully"
5. On error:
   - Show error alert
   - Stay in edit mode

**Cancel:**

1. Click cancel icon
2. Revert row to original data
3. Exit edit mode
4. Remove info alert

**Delete User:**

1. Click delete icon (🗑)
2. Confirmation dialog:
   - Title: "Delete User?"
   - Message: "Are you sure you want to delete {firstName} {lastName}? This will also remove all their course enrollments."
   - Buttons: "Cancel" (gray), "Delete" (red)
3. If confirmed:
   - Send DELETE request
   - Backend deletes user AND all enrollments
   - Remove row from table
   - Show success alert: "User deleted successfully"
4. If cancelled: No action

**Add New User Button:**

- Position: Below table
- Label: "Add New User"
- Icon: ➕
- Action: Opens Add User Modal
- Styling: Primary button

**Loading States:**

- Initial load: Spinner while fetching users
- During save: Disable row, show spinner in save button
- During delete: Disable row, show spinner

**Error Handling:**

- Network error: "Unable to load users. Please try again."
- Save error: Show specific error (e.g., "Email already exists")
- Delete error: "Unable to delete user. Please try again."

---

### 4.3 Add User Modal

**Trigger:** Click "Add New User" in Manage Users Modal  
**Type:** Form modal

#### UI Elements:

```
┌─────────────────────────────────────────────┐
│  Add New User                         [✕]   │
│  (Modal Header)                             │
├─────────────────────────────────────────────┤
│                                             │
│  All fields are required                    │
│  (Info alert)                               │
│                                             │
│  First Name *                               │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field]                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Last Name *                                │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field]                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Email *                                    │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field - email type]          │   │
│  └─────────────────────────────────────┘   │
│  [Validation: Must be unique]               │
│                                             │
│  Job Title *                                │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field]                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Password *                                 │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field - password type]       │   │
│  └─────────────────────────────────────┘   │
│  [Min 6 characters]                         │
│                                             │
│  Role *                                     │
│  ┌─────────────────────────────────────┐   │
│  │ [Dropdown: User ▼ ]                 │   │
│  └─────────────────────────────────────┘   │
│  Options: User, Admin                       │
│                                             │
│  ☑ Active                                   │
│  (Checkbox, checked by default)             │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │    [Create User] Button           │     │
│  └───────────────────────────────────┘     │
│                                             │
│  [Error Alert - Conditional]                │
│  ✗ Email already exists                     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Detailed Annotations:

**Form Fields:**

**1. First Name**

- Type: Text input
- Required: Yes (marked with \*)
- Validation: Not empty, min 2 characters
- Error: "First name is required"

**2. Last Name**

- Type: Text input
- Required: Yes
- Validation: Not empty, min 2 characters
- Error: "Last name is required"

**3. Email**

- Type: Email input
- Required: Yes
- Validation:
  - Not empty
  - Valid email format
  - Unique (not already in database)
- Error Messages:
  - "Email is required"
  - "Invalid email format"
  - "Email already exists"

**4. Job Title**

- Type: Text input
- Required: Yes
- Validation: Not empty
- Placeholder: "e.g., Software Engineer, Marketing Manager"
- Error: "Job title is required"

**5. Password**

- Type: Password input
- Required: Yes
- Validation: Minimum 6 characters
- Helper text: "Min 6 characters" (below field)
- Error: "Password must be at least 6 characters"
- Note: Password will be hashed with bcrypt on backend

**6. Role**

- Type: Dropdown/Select
- Required: Yes
- Options:
  - "User" (default)
  - "Admin"
- Validation: Must select one
- Default: "User"

**7. Active Checkbox**

- Type: Checkbox
- Default: Checked (user is active)
- Label: "Active"
- Note: Unchecked means user account is disabled

**Create User Button:**

- Label: "Create User"
- Enabled: When all required fields valid
- States:
  - **Disabled:** Gray (if validation fails)
  - **Enabled:** Primary blue
  - **Loading:** Spinner, "Creating..."
  - **Success:** Green flash

**Form Submission:**

1. User fills all fields
2. Client-side validation runs
3. If valid: Send POST request to `/api/users/users.php`
4. Backend:
   - Validates data
   - Checks email uniqueness
   - Hashes password
   - Inserts user into database
5. On success:
   - Show success alert: "User created successfully!"
   - Close modal after 1 second
   - Refresh Manage Users table
6. On error:
   - Show error alert with specific message
   - Keep modal open
   - Highlight problematic field

**Validation Timing:**

- On blur: Field-level validation
- On submit: Full form validation
- Real-time: Email format check

---

### 4.4 Add Course Modal

**Trigger:** Click "Add New Course" in Admin Panel  
**Type:** Form modal

#### UI Elements:

```
┌─────────────────────────────────────────────┐
│  Add New Course                       [✕]   │
│  (Modal Header, gradient background)        │
├─────────────────────────────────────────────┤
│                                             │
│  [ℹ Info Alert]                             │
│  All fields marked with * are required      │
│                                             │
│  Course Title *                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field]                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Short Description *                        │
│  ┌─────────────────────────────────────┐   │
│  │ [Textarea - 3 rows]                 │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│  Shown on course cards                      │
│                                             │
│  Full Description (Optional)                │
│  ┌─────────────────────────────────────┐   │
│  │ [Textarea - 5 rows]                 │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│  Shown when user clicks "Show More"         │
│                                             │
│  Instructor *                               │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field]                       │   │
│  └─────────────────────────────────────┘   │
│  e.g., "Dr. Sarah Johnson"                  │
│                                             │
│  Duration *                                 │
│  ┌─────────────────────────────────────┐   │
│  │ [Input field]                       │   │
│  └─────────────────────────────────────┘   │
│  e.g., "8 weeks", "3 months"                │
│                                             │
│  Capacity *                                 │
│  ┌─────────────────────────────────────┐   │
│  │ [Number input: 1-1000]              │   │
│  └─────────────────────────────────────┘   │
│  Default: 30 | Min: 1 | Max: 1000           │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │    [Create Course] Button         │     │
│  └───────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Detailed Annotations:

**Form Fields:**

**1. Course Title**

- Type: Text input
- Required: Yes
- Validation: Not empty, max 255 characters
- Example: "Advanced Web Development with React"
- Error: "Course title is required"

**2. Short Description**

- Type: Textarea (3 rows)
- Required: Yes
- Purpose: Brief overview for course cards
- Validation: Not empty, max 500 characters recommended
- Helper text: "Shown on course cards"
- Example: "Learn modern web development using React, including hooks, state management, and API integration."
- Error: "Short description is required"

**3. Full Description**

- Type: Textarea (5 rows)
- Required: No (optional)
- Purpose: Detailed information shown when user expands course
- Validation: Max 2000 characters
- Helper text: "Shown when user clicks 'Show More'"
- Example: "This comprehensive course covers React fundamentals, advanced patterns, testing, performance optimization, and deployment. Prerequisites: HTML, CSS, JavaScript. Includes hands-on projects."
- Note: If empty, "Show More" link won't appear on course card

**4. Instructor**

- Type: Text input
- Required: Yes
- Validation: Not empty
- Placeholder: "e.g., Dr. Sarah Johnson"
- Example: "Prof. Michael Chen", "Jane Doe, PhD"
- Error: "Instructor name is required"

**5. Duration**

- Type: Text input
- Required: Yes
- Format: Free text (flexible)
- Validation: Not empty
- Placeholder: "e.g., 8 weeks, 3 months"
- Examples: "8 weeks", "12 hours", "Self-paced"
- Helper text: "e.g., '8 weeks', '3 months'"
- Error: "Duration is required"

**6. Capacity**

- Type: Number input
- Required: Yes
- Validation:
  - Minimum: 1
  - Maximum: 1000
  - Must be integer
- Default value: 30
- Helper text: "Default: 30 | Min: 1 | Max: 1000"
- Error: "Capacity must be between 1 and 1000"

**Create Course Button:**

- Label: "Create Course"
- Enabled: When all required fields valid
- States:
  - **Disabled:** Gray
  - **Enabled:** Primary blue
  - **Loading:** Spinner, "Creating Course..."
  - **Success:** Green, "Course Created!"

**Form Submission:**

1. User fills form
2. Client validates required fields
3. Send POST request to `/api/courses/courses.php`
4. Backend inserts course into database
5. On success:
   - Show success alert: "Course created successfully!"
   - Reset form fields
   - Close modal after 1 second
   - Refresh Dashboard (available courses section)
6. On error:
   - Show error alert
   - Keep modal open

**Modal Behavior:**

- Close methods: ✕, backdrop click, ESC key
- Form reset: On successful creation or manual close

---

### 4.5 Edit Course Modal

**Trigger:** Click "Edit" button on any course card (admin only)  
**Type:** Large modal with tabbed interface

#### UI Elements:

```
┌─────────────────────────────────────────────────────────┐
│  Edit Course: [Course Title]                      [✕]   │
│  (Modal Header)                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Tab Navigation]                                       │
│  ┌─────────┐  ┌──────────────┐  ┌─────────┐           │
│  │ Details │  │ Assignments  │  │ Assign  │           │
│  └─────────┘  └──────────────┘  └─────────┘           │
│   (Active)         (Tab 2)         (Tab 3)             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │  [TAB CONTENT - Changes based on active tab]   │   │
│  │                                                 │   │
│  │  See below for each tab's content              │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

#### Tab 1: Details (Edit Course Information)

```
┌─────────────────────────────────────────────┐
│  📝 Edit Course Details                     │
│                                             │
│  Course Title *                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Input with current value]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Short Description *                        │
│  ┌─────────────────────────────────────┐   │
│  │ [Textarea with current value]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Full Description                           │
│  ┌─────────────────────────────────────┐   │
│  │ [Textarea with current value]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Instructor *                               │
│  ┌─────────────────────────────────────┐   │
│  │ [Input with current value]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Duration *                                 │
│  ┌─────────────────────────────────────┐   │
│  │ [Input with current value]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Capacity * (Currently: 18/30 enrolled)     │
│  ┌─────────────────────────────────────┐   │
│  │ [Number input with current value]   │   │
│  └─────────────────────────────────────┘   │
│  ⚠ Cannot set below current enrollment (18) │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  [Update Course] Button (Blue)    │     │
│  └───────────────────────────────────┘     │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  [Delete Course] Button (Red)     │     │
│  └───────────────────────────────────┘     │
│  ⚠ Only enabled if no enrollments           │
│                                             │
└─────────────────────────────────────────────┘
```

**Annotations:**

**Pre-population:**

- All fields pre-filled with current course data
- Fetched when modal opens using course ID

**Capacity Validation:**

- Display current enrollment count
- Minimum value: Current enrolled count
- Error if trying to set below enrollments: "Cannot reduce capacity below {enrolledCount} current enrollments"
- Example: If 18 students enrolled, capacity must be ≥ 18

**Update Course Button:**

- Validates all required fields
- Sends PUT request with updated data
- On success:
  - Show success alert
  - Refresh Dashboard
  - Keep modal open (allow further edits or tab switching)
- On error: Show error alert

**Delete Course Button:**

- Enabled State: Only if `enrolled_count === 0`
- Disabled State: If any enrollments exist
- Disabled message: "Cannot delete course with active enrollments"
- Action (if enabled):
  1. Confirmation dialog:
     - Title: "Delete Course?"
     - Message: "Are you sure you want to permanently delete '{courseTitle}'? This action cannot be undone."
     - Buttons: "Cancel", "Delete" (red)
  2. If confirmed:
     - Send DELETE request
     - Close modal
     - Refresh Dashboard
     - Show success alert: "Course deleted successfully"

---

#### Tab 2: Assignments (View Enrolled Users)

```
┌─────────────────────────────────────────────┐
│  👥 Enrolled Students (18)                  │
│                                             │
│  [Search/Filter - Optional]                 │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  [Data Table]                         │ │
│  │                                       │ │
│  │  Student Name     Email     Enrolled │ │
│  │  ───────────────────────────────────  │ │
│  │  Sarah Johnson    sarah@... Jan 10   │ │
│  │                           [Unassign]  │ │
│  │  ───────────────────────────────────  │ │
│  │  John Smith       john@...  Jan 12   │ │
│  │                           [Unassign]  │ │
│  │  ───────────────────────────────────  │ │
│  │  (More rows...)                       │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Empty State - if no enrollments]          │
│  📚 No students enrolled yet                │
│                                             │
└─────────────────────────────────────────────┘
```

**Annotations:**

**Header:**

- Display: "Enrolled Students ({count})"
- Count updates dynamically

**Table Columns:**

1. **Student Name:** `{firstName} {lastName}`
2. **Email:** User's email address
3. **Enrolled On:** Formatted date (MMM DD, YYYY)
4. **Actions:** Unassign button

**Unassign Button (per row):**

- Label: "Unassign"
- Icon: ✕ or remove icon
- Styling: Small, danger/red
- Action:
  1. Confirmation: "Remove {studentName} from this course?"
  2. If confirmed:
     - Send DELETE to `/api/user-courses.php`
     - Remove row from table
     - Decrement enrolled count
     - Show success alert
     - Refresh course data

**Empty State:**

- Icon: 📚
- Message: "No students enrolled yet"
- Visibility: When `enrollments.length === 0`

**Loading State:**

- Spinner while fetching enrollments

---

#### Tab 3: Assign (Manually Add Users)

```
┌─────────────────────────────────────────────┐
│  ➕ Manually Assign User to Course          │
│                                             │
│  Bypass enrollment limits and manually      │
│  add users to this course.                  │
│                                             │
│  Select User *                              │
│  ┌─────────────────────────────────────┐   │
│  │ [Dropdown - All users]            ▼ │   │
│  └─────────────────────────────────────┘   │
│  Shows: "FirstName LastName - Email"        │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  [Assign User] Button             │     │
│  └───────────────────────────────────┘     │
│                                             │
│  [Success Alert - After assignment]         │
│  ✓ User assigned successfully!              │
│                                             │
│  [Error Alert - If already enrolled]        │
│  ✗ User is already enrolled in this course  │
│                                             │
└─────────────────────────────────────────────┘
```

\*\*Annotations:

**User Dropdown:**

- Fetches all users from database
- Display format: "{firstName} {lastName} - {email}"
- Example: "Sarah Johnson - sarah@example.com"
- Sorted alphabetically by first name
- Placeholder: "Select a user..."

**Assign User Button:**

- Enabled: When user is selected
- Disabled: When no user selected
- Action:
  1. Validate: User not already enrolled
  2. Send POST to `/api/user-courses.php`
  3. Backend creates enrollment (admin override)
  4. On success:
     - Show success alert
     - Reset dropdown
     - Refresh "Assignments" tab count
     - User can assign another
  5. On error:
     - Show error alert (e.g., "User already enrolled", "Course at capacity")
     - Keep dropdown selection

**Admin Override:**

- This assignment bypasses normal capacity checks (if configured)
- No email sent to user (admin-initiated)
- Immediate enrollment

**Form Reset:**

- After successful assignment, dropdown resets to placeholder
- User can assign multiple people without closing modal

---

### 4.6 Assign Course Modal (Alternative Workflow)

**Trigger:** Special admin function (if needed)  
**Type:** Form modal

#### UI Elements:

```
┌─────────────────────────────────────────────┐
│  Assign User to Course                [✕]   │
│  (Modal Header)                             │
├─────────────────────────────────────────────┤
│                                             │
│  Manually enroll a user in a course         │
│                                             │
│  Select User *                              │
│  ┌─────────────────────────────────────┐   │
│  │ [Dropdown - All users]            ▼ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Select Course *                            │
│  ┌─────────────────────────────────────┐   │
│  │ [Dropdown - All courses]          ▼ │   │
│  └─────────────────────────────────────┘   │
│  Shows: Title - Instructor (X/Y enrolled)   │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  [Assign] Button                  │     │
│  └───────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

**Annotations:**

**Select User Dropdown:**

- Lists all users: "{firstName} {lastName} - {email}"
- Required field
- Searchable (if using Select2 or similar)

**Select Course Dropdown:**

- Lists all courses: "{title} - {instructor} ({enrolledCount}/{capacity} enrolled)"
- Shows current capacity status
- Required field
- Example: "React Fundamentals - Dr. Lee (18/30 enrolled)"

**Assign Button:**

- Enabled: When both user and course selected
- Action: Same as "Assign" tab in Edit Course Modal
- Creates enrollment record
- Shows success/error feedback

**Use Case:**

- Quick assignment without navigating to specific course
- Bulk enrollment scenarios
- Alternative to Edit Course → Assign tab

---

### 4.7 Unassign Course Modal (Bulk Unenrollment)

**Trigger:** Special admin function  
**Type:** Multi-select form modal

#### UI Elements:

```
┌─────────────────────────────────────────────┐
│  Unassign Courses                     [✕]   │
│  (Modal Header)                             │
├─────────────────────────────────────────────┤
│                                             │
│  Remove multiple course enrollments         │
│                                             │
│  Select User *                              │
│  ┌─────────────────────────────────────┐   │
│  │ [Dropdown - All users]            ▼ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Select Courses to Unassign                 │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ React Fundamentals                │   │
│  │   (Enrolled: Jan 10, 2026)          │   │
│  │                                     │   │
│  │ ☑ Python for Beginners              │   │
│  │   (Enrolled: Jan 15, 2026)          │   │
│  │                                     │   │
│  │ ☐ Data Science Basics               │   │
│  │   (Enrolled: Jan 20, 2026)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [☐ Select All] [☐ Deselect All]           │
│                                             │
│  Selected: 1 course(s)                      │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  [Unassign Selected] Button       │     │
│  │  (Disabled if none selected)      │     │
│  └───────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

**Annotations:**

**User Selection:**

- Dropdown with all users
- On selection: Load that user's enrolled courses below

**Course Checklist:**

- Dynamic list based on selected user's enrollments
- Each item shows:
  - Checkbox
  - Course title
  - Enrollment date (sub-text)
- If user has no enrollments: "User is not enrolled in any courses"

**Select All / Deselect All:**

- Toggle buttons
- Quickly select/deselect all courses
- Updates selected count

**Selected Count:**

- Live counter: "Selected: X course(s)"
- Updates as user checks/unchecks boxes

**Unassign Selected Button:**

- Enabled: When at least one course checked
- Disabled: When no courses checked
- Action:
  1. Confirmation: "Remove {count} course(s) from {userName}?"
  2. If confirmed:
     - Send batch DELETE requests
     - Remove enrollments from database
     - Show progress (if many courses)
     - On success: "Successfully removed {count} enrollments"
     - Refresh user selection to show updated list

**Use Case:**

- Admin needs to remove user from multiple courses at once
- Bulk unenrollment for graduating students
- Course cleanup

---

## 5. Responsive Breakpoints

### Bootstrap Grid System Implementation

**Breakpoint Definitions:**

- **Extra Small (XS):** <576px (Mobile portrait)
- **Small (SM):** ≥576px (Mobile landscape)
- **Medium (MD):** ≥768px (Tablet)
- **Large (LG):** ≥992px (Desktop)
- **Extra Large (XL):** ≥1200px (Large desktop)

---

### Component Responsive Behaviors

#### Login/Auth Screens

- **XS-SM:** Full width with 16px padding, card width 100%
- **MD+:** Centered card, max-width 450px

#### Dashboard Layout

- **Container:** Bootstrap `.container` (responsive max-width)
- **Padding:** 20px all screens

#### Course Card Grids

**Enrolled & Available Courses Sections:**

- **XS-SM (<768px):** 1 column (full width)
- **MD (768-991px):** 2 columns
- **LG+ (≥992px):** 3 columns
- **Gap:** 20px between cards (all screens)

#### Navbar

- **XS-SM:**
  - Hamburger menu (collapse)
  - Brand left, menu toggle right
  - User info in dropdown or stacked
  - Buttons icon-only
- **MD+:**
  - All elements in single row
  - Full text labels on buttons

#### Modals

- **XS-SM:**
  - 95% screen width
  - Full height on small screens
  - Scrollable content
- **MD:** 600px max-width
- **LG:** 800px max-width for large modals (Edit Course, Manage Users)

#### Tables (Manage Users)

- **XS-SM:**
  - Horizontal scroll enabled
  - Sticky first column (name/email)
  - Reduced font size
- **MD+:**
  - Full table visible
  - Normal font size
  - No scroll needed

#### Forms

- **All Screens:**
  - Full-width inputs
  - Stacked labels (above inputs)
  - Touch-friendly button sizes (min 44px height)

---

### Font Sizes & Spacing

**Typography Scale:**

- **H1:** 32px (XS-SM), 40px (MD+)
- **H2:** 28px (XS-SM), 32px (MD+)
- **H3:** 24px (XS-SM), 28px (MD+)
- **Body:** 14px (XS-SM), 16px (MD+)
- **Small:** 12px (XS-SM), 14px (MD+)

**Spacing:**

- **Section Margins:** 20px (XS-SM), 40px (MD+)
- **Card Padding:** 16px (XS-SM), 24px (MD+)
- **Button Padding:** 10px 16px (all screens)

---

### Touch Targets (Mobile)

- **Minimum Size:** 44x44px for all interactive elements
- **Button Height:** 48px minimum on mobile
- **Input Height:** 48px minimum on mobile
- **Link Spacing:** 8px minimum between links

---

### Performance Considerations

**Image/Icon Loading:**

- Use SVG icons for scalability
- Lazy load course card images (if added)
- Responsive images with srcset (future enhancement)

**Animation:**

- Reduce motion on mobile for performance
- Disable complex animations on low-end devices

---

## Summary for Wireframe Creation

**Total Screens to Design:** 16

1. Login Screen
2. Forgot Password Screen
3. Reset Password Screen
4. Dashboard (with Navbar)
5. Enrolled Courses Section
6. Enrolled Course Card
7. Available Courses Section
8. Available Course Card
9. Admin Panel Modal
10. Manage Users Modal
11. Add User Modal
12. Add Course Modal
13. Edit Course Modal - Details Tab
14. Edit Course Modal - Assignments Tab
15. Edit Course Modal - Assign Tab
16. (Optional) Assign Course Modal
17. (Optional) Unassign Course Modal

**Annotation Requirements:**

- All UI elements labeled
- Interactive states documented
- Validation rules specified
- Error/success states shown
- Responsive breakpoints indicated
- User flows between screens

**Tools Recommended:**

- **Wireframes:** Figma, Adobe XD, Balsamiq, Wireframe.cc, FluidUI
- **Annotations:** Add text boxes, arrows, and callouts within design tool
- **Prototype:** Link screens to show user flows

**Next Steps:**

1. Use this specification document
2. Create visual wireframes in chosen tool
3. Add annotations as text labels/notes
4. Create clickable prototype to demonstrate flows
5. Export as PDF or shareable link for submission

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Created For:** WAD Portfolio Assignment - Task 1
