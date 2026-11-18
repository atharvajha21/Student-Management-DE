# 09: Database Architecture & End-to-End System Flow

## 1. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                        TIER 1: PRESENTATION LAYER                       |
|               (HTML5 Dashboard + CSS3 + Vanilla JavaScript)             |
|                                                                         |
|  - Responsive Single-Page Layout (style.css)                            |
|  - Asynchronous HTTP Calls using Fetch API (app.js)                     |
|  - Live Metrics Counter, Dynamic Modals, Toast Notifications           |
+-------------------------------------------------------------------------+
                                    │
                                    │ HTTP / JSON Payload
                                    │ (GET, POST, PUT, DELETE)
                                    ▼
+-------------------------------------------------------------------------+
|                        TIER 2: APPLICATION BACKEND                      |
|                       (Node.js + Express.js Framework)                  |
|                                                                         |
|  - RESTful API Routing (/api/students, /api/courses, etc.)              |
|  - Body Parsing (express.json) & Cross-Origin Sharing (cors)            |
|  - Input Validation (Domain checking, format checks)                    |
|  - Centralized Error & HTTP Status Code Handling (200, 201, 400, 409)   |
+-------------------------------------------------------------------------+
                                    │
                                    │ Type-Safe Query Calls
                                    │ (prisma.student.create(), etc.)
                                    ▼
+-------------------------------------------------------------------------+
|                     TIER 3: DATA ACCESS & ORM LAYER                     |
|                               (Prisma ORM)                              |
|                                                                         |
|  - Schema Declaration & Migration Engine (schema.prisma)                |
|  - Native Rust-powered Query Engine (libquery-engine)                   |
|  - Automatic SQL Query Generation & Prepared Statements                |
|  - Connection Pooling & Type-Safe Object Mapping                        |
+-------------------------------------------------------------------------+
                                    │
                                    │ Binary PostgreSQL Protocol
                                    │ (TCP / Port 5432)
                                    ▼
+-------------------------------------------------------------------------+
|                      TIER 4: RELATIONAL DATABASE                        |
|                           (PostgreSQL 17 RDBMS)                         |
|                                                                         |
|  - Tables: students, courses, enrollments, attendance                   |
|  - Engine Constraints: PK, FK, CHECK, UNIQUE                            |
|  - Storage Engine: B-Tree Indexes, MVCC Concurrency                     |
|  - ACID Transaction Guarantee & WAL (Write-Ahead Logging)               |
+-------------------------------------------------------------------------+
```

---

## 2. End-to-End Lifecycle of a User Request

To understand how data flows through the system during viva evaluation, consider the example of enrolling a student in a course:

### Step 1: User Action in Presentation Layer
1. The student or admin navigates to the **Enrollments** tab in the dashboard.
2. Selects **Aarav Sharma** from the student dropdown and **Web Application Development (IT302)** from the course dropdown.
3. Clicks **"Enroll Student"**.
4. The JavaScript event handler captures the form submission:
   ```javascript
   fetch('/api/enrollments', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ student_id: 1, course_id: 3, enrollment_date: '2026-11-18' })
   });
   ```

### Step 2: Route Handling in Express.js
1. Express receives the HTTP `POST /api/enrollments` request.
2. Express parses the JSON request body.
3. The route handler checks:
   - Are `student_id` and `course_id` valid integers?
   - Do the referenced entities exist?
4. If invalid, Express returns early with HTTP `400 Bad Request`.

### Step 3: Query Execution via Prisma ORM
1. Express invokes Prisma:
   ```javascript
   await prisma.enrollment.create({
     data: { student_id: 1, course_id: 3, enrollment_date: new Date('2026-11-18') }
   });
   ```
2. The Prisma Query Engine transforms this JavaScript call into a parameterized PostgreSQL `INSERT` statement:
   ```sql
   INSERT INTO "public"."enrollments" ("student_id", "course_id", "enrollment_date")
   VALUES ($1, $2, $3)
   RETURNING "enrollment_id", "student_id", "course_id", "enrollment_date";
   ```

### Step 4: Storage & Integrity Check in PostgreSQL
1. PostgreSQL verifies the foreign key constraints:
   - Does `student_id = 1` exist in `students`? (Yes).
   - Does `course_id = 3` exist in `courses`? (Yes).
2. PostgreSQL checks the unique constraint `enrollments_student_id_course_id_key`:
   - Is student 1 already enrolled in course 3? If yes, it throws error code `23505` (unique violation).
3. If valid, the new row is committed to disk, updated in the B-Tree indexes, and registered in the WAL (Write-Ahead Log).

### Step 5: Response Propagation Back to Frontend
1. PostgreSQL returns the generated tuple with the auto-generated `enrollment_id`.
2. Prisma wraps the row into a clean JavaScript object.
3. Express responds with HTTP `201 Created` and JSON payload.
4. The frontend Fetch promise resolves, triggers a success toast, and refreshes the enrollments table and dashboard counter in real time.
