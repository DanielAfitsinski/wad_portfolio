# TechCourses4U - Design Documentation README

**Project:** Learning Management System  
**Created:** January 2026  
**Purpose:** Assignment Task 1 - WebApp Design Documentation

---

## 📋 Overview

This folder contains comprehensive design documentation for the TechCourses4U Learning Management System, created retrospectively from an already-built application. The documentation satisfies assignment requirements for **Task One: WebApp Designs**, including annotated wireframes and database ERD.

---

## 📁 Documentation Files

### 1. **WIREFRAMES.md** (Annotated Wireframe Specifications)

**Purpose:** Complete wireframe documentation for all screens and components

**Contents:**

- 16+ detailed screen/component specifications
- UI element descriptions and annotations
- Interactive states (loading, error, success)
- Validation rules and user feedback
- Responsive design breakpoints
- Component interactions and flows

**Screens Documented:**

- Authentication (Login, Forgot Password, Reset Password)
- Dashboard with Navbar
- Course display sections (Enrolled, Available)
- Course cards with enrollment functionality
- 7 Admin modals (User management, Course management)

**Use This For:**

- Creating visual wireframes in Figma/Adobe XD/Balsamiq
- Understanding UI/UX design decisions
- Implementing frontend components
- Design presentations and walkthroughs

---

### 2. **DATABASE-ERD.md** (Database Entity Relationship Diagram)

**Purpose:** Complete database schema and relationship documentation

**Contents:**

- 6 database tables with full specifications
- Field definitions (name, type, constraints, defaults)
- Primary and foreign keys
- Relationships and cardinality (crow's foot notation)
- Business rules and constraints
- SQL CREATE statements
- Index strategy and performance notes
- Sample data and queries

**Tables Documented:**

1. `users` - User accounts (regular + admin)
2. `courses` - Course offerings
3. `course_enrollments` - Junction table (many-to-many)
4. `auth_tokens` - Session management
5. `login_attempts` - Rate limiting and security
6. `password_reset_tokens` - Password recovery

**Use This For:**

- Creating visual ERD in Lucidchart/draw.io/dbdiagram.io
- Understanding data model and relationships
- Database schema presentations
- SQL implementation reference

---

### 3. **USER-JOURNEYS.md** (User Journey Storyboards)

**Purpose:** Storyboarding key application functionality through user flows

**Contents:**

- 5 critical user journeys with step-by-step flows
- Screen transitions and decision points
- System validations and processes
- Error handling scenarios
- Storyboard frames with annotations

**Journeys Documented:**

1. **Standard User Login** - Authentication with rate limiting
2. **Password Reset Flow** - Forgot password → Email → Reset
3. **Course Enrollment Process** - Browse → Enroll → Confirmation
4. **Admin User Management** - Edit users, change roles, delete accounts
5. **Admin Course Assignment** - Manually enroll users in courses

**Use This For:**

- Creating visual storyboards with wireframes
- Understanding user workflows
- Demonstrating application functionality
- User experience presentations

---

### 4. **TECHNICAL-NOTES.md** (Technical Annotations & Implementation)

**Purpose:** Technical architecture and implementation details

**Contents:**

- Complete technology stack (React, TypeScript, PHP, MySQL)
- Authentication & security architecture
- API endpoint reference (15+ endpoints)
- Frontend and backend architecture
- Email system configuration
- Security features (bcrypt, CSRF, XSS prevention)
- Performance optimization strategies

**Use This For:**

- Understanding technical implementation
- API integration reference
- Security architecture review
- Development team onboarding

---

## 🎯 Assignment Task Mapping

### Task Requirement: **Annotated Wireframe Diagrams**

**✅ Satisfied By:** `WIREFRAMES.md`

- 16+ screen/component specifications with detailed annotations
- UI elements, interactions, states documented
- Responsive design considerations included

**Next Steps:**

1. Open `WIREFRAMES.md`
2. Choose design tool (Figma, Adobe XD, Balsamiq, Wireframe.cc)
3. Create visual wireframes based on specifications
4. Add annotations using text boxes and callouts
5. Export as PDF or shareable link

---

### Task Requirement: **Database ERD**

**✅ Satisfied By:** `DATABASE-ERD.md`

- Complete database schema with 6 tables
- All fields, data types, and constraints documented
- Relationships with cardinality specified
- Crow's foot notation guidance included

**Next Steps:**

1. Open `DATABASE-ERD.md`
2. Choose ERD tool (Lucidchart, draw.io, dbdiagram.io, MySQL Workbench)
3. Create entity boxes with all fields
4. Draw relationships with crow's foot notation
5. Add annotations for constraints and business rules
6. Export as PDF or image

---

### Task Requirement: **Storyboarding Key Application Functionality**

**✅ Satisfied By:** `USER-JOURNEYS.md`

- 5 comprehensive user journeys documented
- Step-by-step flows with screen transitions
- Decision points and error handling
- Storyboard frame descriptions included

**Next Steps:**

1. Open `USER-JOURNEYS.md`
2. Select 3-5 journeys to visualize
3. Create visual storyboard frames (wireframes + annotations)
4. Show flow arrows and decision diamonds
5. Highlight key interactions and validations
6. Combine into presentation format

---

## 🛠️ Recommended Tools

### Wireframe Tools

- **Figma** (Free, collaborative, web-based) ⭐ Recommended
- **Adobe XD** (Free starter, professional features)
- **Balsamiq** (Quick sketching, low-fidelity)
- **Wireframe.cc** (Simple, minimalist)
- **FluidUI** (Interactive prototypes)

### ERD Tools

- **dbdiagram.io** (Text-to-diagram, fast) ⭐ Recommended
- **Lucidchart** (Professional, templates)
- **draw.io / diagrams.net** (Free, open source)
- **MySQL Workbench** (Auto-generate from database)
- **Microsoft Visio** (Enterprise option)

### Storyboard Tools

- **Figma/Adobe XD** (Wireframes + flows)
- **Miro/Mural** (Whiteboarding, collaborative)
- **PowerPoint/Keynote** (Simple slide-based)
- **Hand-drawn sketches** (Quick and effective)

---

## 📊 Quick Reference

### Application Summary

- **Name:** TechCourses4U / CourseHub
- **Type:** Learning Management System (LMS)
- **User Roles:** Regular User, Admin
- **Main Features:**
  - User authentication (email/password + Google OAuth)
  - Course browsing and enrollment
  - Email confirmations
  - Admin panel (user/course management)
  - Rate limiting and security

### Technical Stack

- **Frontend:** React 19.2 + TypeScript 5.9 + Bootstrap 5.3
- **Backend:** PHP 8.0+ + MySQL 8.0+
- **Auth:** Token-based (64-char hex, 1-hour expiration)
- **Email:** PHPMailer 6.8 (SMTP)

### Statistics

- **Screens:** 16+ distinct UI components
- **Database Tables:** 6 tables
- **API Endpoints:** 15+ RESTful endpoints
- **User Journeys:** 5 documented flows
- **Relationships:** 1 many-to-many, 4 one-to-many

---

## 📝 How to Use This Documentation

### For Creating Wireframes:

```
1. Read WIREFRAMES.md section for your target screen
2. Note all UI elements, annotations, and states
3. Create visual mockup in your chosen tool
4. Add annotations (text boxes, arrows, callouts)
5. Show different states (normal, loading, error, success)
6. Repeat for all screens
7. Export as PDF
```

### For Creating Database ERD:

```
1. Read DATABASE-ERD.md
2. Note all 6 tables with fields and types
3. Open your ERD tool
4. Create entity boxes (rectangles)
5. Add all fields with data types
6. Mark primary keys (underline or 🔑)
7. Mark foreign keys (FK notation or 🔗)
8. Draw relationships with crow's foot notation
9. Add cardinality labels (1, *, 0..*, etc.)
10. Export as image or PDF
```

### For Creating User Journey Storyboards:

```
1. Read USER-JOURNEYS.md
2. Choose 3-5 journeys to visualize
3. For each journey:
   - Create flow diagram (boxes and arrows)
   - Create 5-8 screen frames
   - Annotate user actions (blue)
   - Annotate system actions (green)
   - Show decision points (diamonds)
   - Highlight errors and validations
4. Combine into presentation
5. Export as PDF
```

---

## ✅ Submission Checklist

Before submitting your assignment, ensure you have:

- [ ] Created visual wireframes for at least 10+ screens
- [ ] Added annotations to wireframes (UI elements, interactions)
- [ ] Created database ERD with all 6 tables
- [ ] Shown relationships with crow's foot notation
- [ ] Documented primary keys, foreign keys, and constraints
- [ ] Created storyboards for 3-5 user journeys
- [ ] Shown screen transitions and user flows
- [ ] Included error handling in journeys
- [ ] Exported all designs as PDF or images
- [ ] Organized documentation clearly
- [ ] Added labels and legends to diagrams

---

## 🎓 Tips for Success

1. **Be Thorough:** Include all screens and states (not just happy paths)
2. **Use Annotations:** Every UI element should have a purpose note
3. **Show Relationships Clearly:** Use proper crow's foot notation
4. **Include Error States:** Show what happens when things go wrong
5. **Keep It Professional:** Clean layouts, readable fonts, consistent styling
6. **Add Context:** Include brief descriptions of what each screen does
7. **Use Color Coding:** Different colors for different entity types or states
8. **Test Your Flow:** Walk through user journeys to ensure they make sense

---

## 📞 Questions?

If you have questions while creating your visual designs:

1. **Wireframes:** Check WIREFRAMES.md for detailed UI specifications
2. **Database:** Check DATABASE-ERD.md for field types and relationships
3. **User Flows:** Check USER-JOURNEYS.md for step-by-step processes
4. **Technical Details:** Check TECHNICAL-NOTES.md for implementation info

---

## 🚀 Good Luck!

This documentation provides everything you need to create professional design documentation for your assignment. Take your time, be thorough, and create clear, well-annotated diagrams that demonstrate your understanding of the application's design and architecture.

**Remember:** These documents are your detailed blueprints. Your job is to transform them into visual, professional-quality design artifacts using your chosen tools.

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Created For:** WAD Portfolio Assignment - Task 1
