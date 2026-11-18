# 09: Data Integrity & Performance Considerations

## 1. What is Data Integrity?
**Data Integrity** ensures that data stored inside the database is accurate, complete, reliable, and consistent throughout its entire lifecycle. In our Student Management System, data integrity is enforced across four distinct levels:

---

## 2. Integrity Enforcement Mechanisms

### 1. Entity Integrity (`PRIMARY KEY`)
- **Concept:** Every row in a relation must be uniquely identifiable, and no primary key column can accept `NULL`.
- **Implementation:**
  - `students.student_id` (SERIAL PRIMARY KEY)
  - `courses.course_id` (SERIAL PRIMARY KEY)
  - `enrollments.enrollment_id` (SERIAL PRIMARY KEY)
  - `attendance.attendance_id` (SERIAL PRIMARY KEY)
- **Engine Enforcement:** PostgreSQL automatically creates a unique B-Tree index on each primary key to ensure $O(\log n)$ lookup and prevent duplicate primary keys.

### 2. Referential Integrity (`FOREIGN KEY` & Cascades)
- **Concept:** Prevents child tables from referencing non-existent records in parent tables.
- **Implementation:**
  - `enrollments.student_id REFERENCES students(student_id) ON DELETE CASCADE`
  - `enrollments.course_id REFERENCES courses(course_id) ON DELETE CASCADE`
  - `attendance.enrollment_id REFERENCES enrollments(enrollment_id) ON DELETE CASCADE`
- **Why `ON DELETE CASCADE`?**
  - If a student leaves the college, deleting their profile cleans up all associated enrollment and attendance history automatically.
  - Guarantees zero "orphan" records in the database.

### 3. Domain Integrity (`CHECK` & `NOT NULL` Constraints)
- **Concept:** Restricts the values that can be stored in a column to valid ranges or predefined sets.
- **Implementation:**
  - `NOT NULL`: Applied on mandatory attributes (`name`, `email`, `department`, `course_name`, `course_code`, `credits`, `attendance_date`, `status`).
  - `CHECK (credits >= 1 AND credits <= 6)`: Guarantees no course has unrealistic negative credits or 100 credits.
  - `CHECK (status IN ('Present', 'Absent'))`: Restricts attendance status strictly to two valid states, rejecting typos like `'Here'` or `'Late'`.

### 4. Uniqueness Integrity (`UNIQUE` Constraints)
- **Concept:** Prevents duplicate values across single or composite columns.
- **Implementation:**
  - Single Column: `students(email)` UNIQUE and `courses(course_code)` UNIQUE.
  - Multi-Column Composite: `enrollments(student_id, course_id)` UNIQUE (prevents enrolling the same student twice in the same course).
  - Multi-Column Composite: `attendance(enrollment_id, attendance_date)` UNIQUE (prevents marking attendance twice on the same day for one enrollment).

---

## 3. Database Performance & Indexing

### What is an Index? (Simple Explanation)
An **Index** is like the index at the back of a textbook. Without an index, finding a topic requires flipping through every single page from start to finish (known in databases as a **Full Table Scan** or sequential scan). With an index, the database jumps directly to the exact page where the record resides in $O(\log n)$ steps.

### Implemented Indexes & Justification:

| Index Name | Table & Columns | Type | Justification / Query Benefit |
| :--- | :--- | :---: | :--- |
| `students_pkey` | `students(student_id)` | B-Tree (Default) | Fast single-row lookups for student profiles. |
| `students_email_key` | `students(email)` | B-Tree (Unique) | Enforces unique email constraint and speeds up login/duplicate checks. |
| `idx_students_department` | `students(department)` | B-Tree | Accelerates department-based filtering (Query 03: `WHERE department = 'Computer Science'`). |
| `courses_pkey` | `courses(course_id)` | B-Tree (Default) | Fast single-row lookups for course data. |
| `courses_course_code_key` | `courses(course_code)` | B-Tree (Unique) | Accelerates catalog lookups by code (`CS301`). |
| `idx_enrollments_student_id` | `enrollments(student_id)` | B-Tree | Speeds up JOINs between `students` and `enrollments`. |
| `idx_enrollments_course_id` | `enrollments(course_id)` | B-Tree | Speeds up JOINs between `courses` and `enrollments` and group counts. |
| `enrollments_student_course_uk` | `enrollments(student_id, course_id)` | B-Tree (Unique) | Eliminates duplicate enrollments and speeds up composite lookups. |
| `idx_attendance_enrollment_id` | `attendance(enrollment_id)` | B-Tree | Accelerates attendance retrieval for a specific student's enrollment. |
| `attendance_enroll_date_uk` | `attendance(enrollment_id, attendance_date)` | B-Tree (Unique) | Enforces 1 attendance log per day per student course enrollment. |

---

## 4. Scalability Considerations

For scaling to hundreds of thousands of students:
1. **Connection Pooling:** Prisma utilizes a built-in connection pool to reuse database connections, minimizing connection handshake overhead.
2. **Prepared Statements:** Parameterized queries allow PostgreSQL to cache query execution plans, saving CPU parsing time.
3. **Partitioning:** In very large institutional databases, the `attendance` table can be range-partitioned by academic year or semester date (e.g. `attendance_2026_q1`, `attendance_2026_q2`) to maintain fast write and query speeds.
