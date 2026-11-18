# 04: Database Schema Documentation

This document describes the physical database schema for the **Student Management System** implemented in **PostgreSQL 17**.

---

## Database Summary
- **Database Name:** `student_management`
- **Default Schema:** `public`
- **Total Tables:** 4 Core Domain Tables + 1 Migration Metadata Table

---

## Table 1: `students`
Stores individual registered students.

| Column | Data Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `student_id` | `SERIAL` (INTEGER) | **NO** | `nextval(...)` | **PRIMARY KEY** (Auto-incrementing unique identifier) |
| `name` | `VARCHAR(100)` | **NO** | *None* | Full student name |
| `email` | `VARCHAR(150)` | **NO** | *None* | **UNIQUE**, Student email address |
| `phone` | `VARCHAR(15)` | YES | `NULL` | Student contact number |
| `department` | `VARCHAR(100)` | **NO** | *None* | Academic department name (Indexed) |
| `created_at` | `TIMESTAMP(6)` | **NO** | `CURRENT_TIMESTAMP` | Account creation timestamp |

### Indexes & Keys:
- `students_pkey`: `PRIMARY KEY (student_id)`
- `students_email_key`: `UNIQUE (email)`
- `idx_students_department`: B-Tree index on `(department)`

### Referential Dependents:
- Referenced by `enrollments.student_id` with `ON DELETE CASCADE ON UPDATE CASCADE`.

---

## Table 2: `courses`
Stores academic courses offered by the institution.

| Column | Data Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `course_id` | `SERIAL` (INTEGER) | **NO** | `nextval(...)` | **PRIMARY KEY** (Auto-incrementing unique identifier) |
| `course_name` | `VARCHAR(100)` | **NO** | *None* | Official title of the course |
| `course_code` | `VARCHAR(20)` | **NO** | *None* | **UNIQUE**, Course catalog code (e.g., `CS301`) |
| `credits` | `INTEGER` | **NO** | *None* | **CHECK** (`credits >= 1 AND credits <= 6`) |

### Indexes & Keys:
- `courses_pkey`: `PRIMARY KEY (course_id)`
- `courses_course_code_key`: `UNIQUE (course_code)`

### Check Constraints:
- `courses_credits_check`: `CHECK (credits >= 1 AND credits <= 6)`

### Referential Dependents:
- Referenced by `enrollments.course_id` with `ON DELETE CASCADE ON UPDATE CASCADE`.

---

## Table 3: `enrollments`
Associative junction table resolving the **Many-to-Many** relationship between `students` and `courses`.

| Column | Data Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `enrollment_id` | `SERIAL` (INTEGER) | **NO** | `nextval(...)` | **PRIMARY KEY** (Unique enrollment record ID) |
| `student_id` | `INTEGER` | **NO** | *None* | **FOREIGN KEY** referencing `students(student_id)` |
| `course_id` | `INTEGER` | **NO** | *None* | **FOREIGN KEY** referencing `courses(course_id)` |
| `enrollment_date` | `DATE` | **NO** | `CURRENT_DATE` | Date on which enrollment occurred |

### Indexes & Keys:
- `enrollments_pkey`: `PRIMARY KEY (enrollment_id)`
- `enrollments_student_id_course_id_key`: `UNIQUE (student_id, course_id)` (prevents multiple enrollments in the same course)
- `idx_enrollments_student_id`: B-Tree index on `(student_id)`
- `idx_enrollments_course_id`: B-Tree index on `(course_id)`

### Foreign Key Constraints:
- `enrollments_student_id_fkey`: `FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE`
- `enrollments_course_id_fkey`: `FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE`

### Referential Dependents:
- Referenced by `attendance.enrollment_id` with `ON DELETE CASCADE ON UPDATE CASCADE`.

---

## Table 4: `attendance`
Tracks daily presence/absence records for active course enrollments.

| Column | Data Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `attendance_id` | `SERIAL` (INTEGER) | **NO** | `nextval(...)` | **PRIMARY KEY** (Unique attendance entry ID) |
| `enrollment_id` | `INTEGER` | **NO** | *None* | **FOREIGN KEY** referencing `enrollments(enrollment_id)` |
| `attendance_date` | `DATE` | **NO** | *None* | Calendar date of attendance |
| `status` | `VARCHAR(10)` | **NO** | *None* | **CHECK** (`status IN ('Present', 'Absent')`) |

### Indexes & Keys:
- `attendance_pkey`: `PRIMARY KEY (attendance_id)`
- `attendance_enrollment_id_attendance_date_key`: `UNIQUE (enrollment_id, attendance_date)` (prevents duplicate logs on same date)
- `idx_attendance_enrollment_id`: B-Tree index on `(enrollment_id)`

### Check Constraints:
- `attendance_status_check`: `CHECK (status IN ('Present', 'Absent'))`

### Foreign Key Constraints:
- `attendance_enrollment_id_fkey`: `FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE ON UPDATE CASCADE`

---

## Cascading Rule Justification: `ON DELETE CASCADE`
When a student leaves or is purged from the college database:
1. Deleting from `students` triggers an automated cascade to all matching rows in `enrollments`.
2. Deleting an enrollment automatically triggers an automated cascade to all matching rows in `attendance`.
3. This eliminates **orphan records** and guarantees strict **referential integrity** without manual multi-step script maintenance.
