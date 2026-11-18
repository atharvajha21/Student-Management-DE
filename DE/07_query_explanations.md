# Data Engineering Project: SQL Queries & Execution Explanations

This document details the 12 core SQL queries implemented and verified against PostgreSQL 17 for the **Student Management System**.

---

## Summary of Executed Queries

| Query # | Name / Purpose | Core SQL Concepts Demonstrated |
| :---: | :--- | :--- |
| **01** | Safe Student Insertion | `INSERT INTO`, `RETURNING`, `BEGIN / ROLLBACK` Transaction |
| **02** | Select All Students | Projection, Table Scan, `ORDER BY` Primary Key |
| **03** | Filter Students by Department | Predicate Filtering (`WHERE`) |
| **04** | Alphabetical Sorting | Result Set Ordering (`ORDER BY ASC`) |
| **05** | Update Student Details | `UPDATE`, `SET`, `WHERE` within atomic Transaction |
| **06** | Safe Deletion | `DELETE`, `WHERE`, Referential Integrity demonstration |
| **07** | Total Student Count | Aggregate function `COUNT(*)` |
| **08** | Students Enrolled per Course | `GROUP BY`, `COUNT()`, `LEFT JOIN` |
| **09** | Filter Aggregated Groups | `HAVING` clause filtering group metrics |
| **10** | Inner Relational Join | 3-table `INNER JOIN` (students ↔ enrollments ↔ courses) |
| **11** | Left Outer Join | `LEFT OUTER JOIN` showing students with & without enrollments |
| **12** | Nested Subquery Analysis | Subquery inside `HAVING` comparing against aggregate average |

---

### Query 01: Safe Student Insertion

#### SQL Code
```sql
BEGIN;
INSERT INTO students (name, email, phone, department)
VALUES ('Kavya Deshmukh', 'kavya.deshmukh@example.edu', '9876543220', 'Computer Science')
RETURNING student_id, name, email, department, created_at;
ROLLBACK;
```

#### Purpose & Explanation
Demonstrates inserting a new tuple into the `students` relation. Using PostgreSQL's `RETURNING` clause returns the newly generated auto-incrementing `student_id` and the default `created_at` timestamp immediately. The operation is wrapped in a `BEGIN ... ROLLBACK` transaction block so the test does not pollute the baseline sample records.

#### Actual Execution Output
```text
BEGIN
 student_id |      name      |           email            |    department    |         created_at         
------------+----------------+----------------------------+------------------+----------------------------
         11 | Kavya Deshmukh | kavya.deshmukh@example.edu | Computer Science | 2026-11-18 17:31:19.690196
(1 row)

INSERT 0 1
ROLLBACK
```

---

### Query 02: Select All Students

#### SQL Code
```sql
SELECT student_id, name, email, phone, department, created_at
FROM students
ORDER BY student_id ASC;
```

#### Purpose & Explanation
Retrieves all attributes from the `students` table. Explicit projection (specifying column names instead of `SELECT *`) is a data engineering best practice that minimizes network overhead and prevents schema mismatches.

#### Actual Execution Output
```text
 student_id |      name       |            email            |   phone    |       department       |     created_at      
------------+-----------------+-----------------------------+------------+------------------------+---------------------
          1 | Aarav Sharma    | aarav.sharma@example.edu    | 9876543210 | Computer Science       | 2026-08-01 09:30:00
          2 | Diya Patel      | diya.patel@example.edu      | 9876543211 | Information Technology | 2026-08-01 10:15:00
          3 | Rohan Iyer      | rohan.iyer@example.edu      | 9876543212 | Computer Science       | 2026-08-02 11:00:00
          4 | Ananya Gupta    | ananya.gupta@example.edu    | 9876543213 | Electronics            | 2026-08-02 11:45:00
          5 | Kabir Mehta     | kabir.mehta@example.edu     | 9876543214 | Mechanical             | 2026-08-03 14:00:00
          6 | Sneha Rao       | sneha.rao@example.edu       | 9876543215 | Computer Science       | 2026-08-03 14:30:00
          7 | Vikram Malhotra | vikram.malhotra@example.edu | 9876543216 | Electronics            | 2026-08-04 15:15:00
          8 | Priya Nair      | priya.nair@example.edu      | 9876543217 | Information Technology | 2026-08-04 16:00:00
          9 | Siddharth Verma | siddharth.verma@example.edu | 9876543218 | Mechanical             | 2026-08-05 09:00:00
         10 | Tanvi Kulkarni  | tanvi.kulkarni@example.edu  | 9876543219 | Civil                  | 2026-08-05 10:30:00
(10 rows)
```

---

### Query 03: Filter Students by Department

#### SQL Code
```sql
SELECT student_id, name, email, department
FROM students
WHERE department = 'Computer Science'
ORDER BY student_id ASC;
```

#### Purpose & Explanation
Demonstrates row-level predicate filtering using the `WHERE` clause. This query utilizes the B-Tree index created on `students(department)` to execute index scans instead of full sequential scans.

#### Actual Execution Output
```text
 student_id |     name     |          email           |    department    
------------+--------------+--------------------------+------------------
          1 | Aarav Sharma | aarav.sharma@example.edu | Computer Science
          3 | Rohan Iyer   | rohan.iyer@example.edu   | Computer Science
          6 | Sneha Rao    | sneha.rao@example.edu    | Computer Science
(3 rows)
```

---

### Query 04: Order Students Alphabetically

#### SQL Code
```sql
SELECT student_id, name, email, department
FROM students
ORDER BY name ASC;
```

#### Purpose & Explanation
Sorts the output alphabetically by the `name` column in ascending (`ASC`) collation. Crucial for reporting, directory views, and UI dropdown presentations.

#### Actual Execution Output
```text
 student_id |      name       |            email            |       department       
------------+-----------------+-----------------------------+------------------------
          1 | Aarav Sharma    | aarav.sharma@example.edu    | Computer Science
          4 | Ananya Gupta    | ananya.gupta@example.edu    | Electronics
          2 | Diya Patel      | diya.patel@example.edu      | Information Technology
          5 | Kabir Mehta     | kabir.mehta@example.edu     | Mechanical
          8 | Priya Nair      | priya.nair@example.edu      | Information Technology
          3 | Rohan Iyer      | rohan.iyer@example.edu      | Computer Science
          9 | Siddharth Verma | siddharth.verma@example.edu | Mechanical
          6 | Sneha Rao       | sneha.rao@example.edu       | Computer Science
         10 | Tanvi Kulkarni  | tanvi.kulkarni@example.edu  | Civil
          7 | Vikram Malhotra | vikram.malhotra@example.edu | Electronics
(10 rows)
```

---

### Query 05: Update Student Information

#### SQL Code
```sql
BEGIN;
UPDATE students
SET phone = '9999988888', department = 'Data Science'
WHERE email = 'aarav.sharma@example.edu'
RETURNING student_id, name, email, phone, department;
ROLLBACK;
```

#### Purpose & Explanation
Demonstrates DML `UPDATE` with a targeting `WHERE` clause on a `UNIQUE` attribute (`email`). Modifies specific fields and validates modified tuple values via `RETURNING`. Transaction rollback preserves dataset integrity.

#### Actual Execution Output
```text
BEGIN
 student_id |     name     |          email           |   phone    |  department  
------------+--------------+--------------------------+------------+--------------
          1 | Aarav Sharma | aarav.sharma@example.edu | 9999988888 | Data Science
(1 row)

UPDATE 1
ROLLBACK
```

---

### Query 06: Delete a Student Safely

#### SQL Code
```sql
BEGIN;
INSERT INTO students (name, email, phone, department)
VALUES ('Temporary Test Student', 'temp.student@example.edu', '9000000000', 'Civil');

DELETE FROM students
WHERE email = 'temp.student@example.edu'
RETURNING student_id, name, email;
ROLLBACK;
```

#### Purpose & Explanation
Demonstrates safe tuple deletion. By creating a temporary student and immediately deleting it within a transaction, we confirm that `DELETE` triggers cascade rules and primary key index updates cleanly.

#### Actual Execution Output
```text
BEGIN
INSERT 0 1
 student_id |          name          |          email           
------------+------------------------+--------------------------
         12 | Temporary Test Student | temp.student@example.edu
(1 row)

DELETE 1
ROLLBACK
```

---

### Query 07: Count Total Students

#### SQL Code
```sql
SELECT COUNT(*) AS total_students
FROM students;
```

#### Purpose & Explanation
Standard SQL aggregate function that computes the cardinality (total row count) of the `students` relation. Used directly on frontend dashboard counters.

#### Actual Execution Output
```text
 total_students 
----------------
             10
(1 row)
```

---

### Query 08: Count Students Enrolled per Course

#### SQL Code
```sql
SELECT 
    c.course_id,
    c.course_name,
    c.course_code,
    c.credits,
    COUNT(e.student_id) AS enrolled_students_count
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name, c.course_code, c.credits
ORDER BY enrolled_students_count DESC, c.course_id ASC;
```

#### Purpose & Explanation
Combines `LEFT JOIN` and `GROUP BY` across courses and enrollments. Using `LEFT JOIN` guarantees courses with 0 enrollments still show up with a count of 0.

#### Actual Execution Output
```text
 course_id |          course_name           | course_code | credits | enrolled_students_count 
-----------+--------------------------------+-------------+---------+-------------------------
         1 | Database Engineering           | CS301       |       4 |                       5
         2 | Data Structures & Algorithms   | CS201       |       4 |                       3
         3 | Web Application Development    | IT302       |       3 |                       3
         4 | Digital Electronics            | EC204       |       3 |                       2
         5 | Thermodynamics & Heat Transfer | ME201       |       4 |                       1
(5 rows)
```

---

### Query 09: HAVING Clause to Filter Courses with More Than One Student

#### SQL Code
```sql
SELECT 
    c.course_id,
    c.course_name,
    c.course_code,
    COUNT(e.student_id) AS enrolled_count
FROM courses c
INNER JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name, c.course_code
HAVING COUNT(e.student_id) > 1
ORDER BY enrolled_count DESC;
```

#### Purpose & Explanation
Demonstrates the fundamental difference between `WHERE` (filters rows before grouping) and `HAVING` (filters groups after aggregation). Only courses where `COUNT(e.student_id) > 1` are selected.

#### Actual Execution Output
```text
 course_id |         course_name          | course_code | enrolled_count 
-----------+------------------------------+-------------+----------------
         1 | Database Engineering         | CS301       |              5
         2 | Data Structures & Algorithms | CS201       |              3
         3 | Web Application Development  | IT302       |              3
         4 | Digital Electronics          | EC204       |              2
(4 rows)
```

---

### Query 10: Multi-Table INNER JOIN

#### SQL Code
```sql
SELECT 
    s.student_id,
    s.name AS student_name,
    s.department,
    c.course_code,
    c.course_name,
    c.credits,
    e.enrollment_date
FROM students s
INNER JOIN enrollments e ON s.student_id = e.student_id
INNER JOIN courses c ON e.course_id = c.course_id
ORDER BY s.student_id ASC, c.course_code ASC;
```

#### Purpose & Explanation
Traverses the Many-to-Many relationship between `students` and `courses` via the bridge junction table `enrollments`. Displays all valid enrollment pairings.

#### Actual Execution Output
```text
 student_id |  student_name   |       department       | course_code |          course_name           | credits | enrollment_date 
------------+-----------------+------------------------+-------------+--------------------------------+---------+-----------------
          1 | Aarav Sharma    | Computer Science       | CS201       | Data Structures & Algorithms   |       4 | 2026-08-10
          1 | Aarav Sharma    | Computer Science       | CS301       | Database Engineering           |       4 | 2026-08-10
          1 | Aarav Sharma    | Computer Science       | IT302       | Web Application Development    |       3 | 2026-08-11
          2 | Diya Patel      | Information Technology | CS301       | Database Engineering           |       4 | 2026-08-10
          2 | Diya Patel      | Information Technology | IT302       | Web Application Development    |       3 | 2026-08-11
          3 | Rohan Iyer      | Computer Science       | CS201       | Data Structures & Algorithms   |       4 | 2026-08-11
          3 | Rohan Iyer      | Computer Science       | CS301       | Database Engineering           |       4 | 2026-08-10
          3 | Rohan Iyer      | Computer Science       | IT302       | Web Application Development    |       3 | 2026-08-12
          4 | Ananya Gupta    | Electronics            | CS301       | Database Engineering           |       4 | 2026-08-10
          4 | Ananya Gupta    | Electronics            | EC204       | Digital Electronics            |       3 | 2026-08-11
          5 | Kabir Mehta     | Mechanical             | ME201       | Thermodynamics & Heat Transfer |       4 | 2026-08-12
          6 | Sneha Rao       | Computer Science       | CS201       | Data Structures & Algorithms   |       4 | 2026-08-11
          6 | Sneha Rao       | Computer Science       | CS301       | Database Engineering           |       4 | 2026-08-10
          7 | Vikram Malhotra | Electronics            | EC204       | Digital Electronics            |       3 | 2026-08-12
(14 rows)
```

---

### Query 11: LEFT OUTER JOIN (Preserving Unmatched Records)

#### SQL Code
```sql
SELECT 
    s.student_id,
    s.name AS student_name,
    s.department,
    COALESCE(c.course_code, 'NO ENROLLMENT') AS course_code,
    COALESCE(c.course_name, 'No Course Enrolled') AS course_name,
    COALESCE(c.credits::text, '0') AS credits
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
LEFT JOIN courses c ON e.course_id = c.course_id
ORDER BY s.student_id ASC, c.course_code ASC NULLS FIRST;
```

#### Purpose & Explanation
Demonstrates preserving left-table records when no foreign-key matches exist in child tables. Notice students 8, 9, and 10 (Tanvi Kulkarni, etc.) appear with `NO ENROLLMENT`, which would have been excluded in an `INNER JOIN`.

#### Actual Execution Output
```text
 student_id |  student_name   |       department       |  course_code  |          course_name           | credits 
------------+-----------------+------------------------+---------------+--------------------------------+---------
          1 | Aarav Sharma    | Computer Science       | CS201         | Data Structures & Algorithms   | 4
          1 | Aarav Sharma    | Computer Science       | CS301         | Database Engineering           | 4
          1 | Aarav Sharma    | Computer Science       | IT302         | Web Application Development    | 3
          2 | Diya Patel      | Information Technology | CS301         | Database Engineering           | 4
          2 | Diya Patel      | Information Technology | IT302         | Web Application Development    | 3
          3 | Rohan Iyer      | Computer Science       | CS201         | Data Structures & Algorithms   | 4
          3 | Rohan Iyer      | Computer Science       | CS301         | Database Engineering           | 4
          3 | Rohan Iyer      | Computer Science       | IT302         | Web Application Development    | 3
          4 | Ananya Gupta    | Electronics            | CS301         | Database Engineering           | 4
          4 | Ananya Gupta    | Electronics            | EC204         | Digital Electronics            | 3
          5 | Kabir Mehta     | Mechanical             | ME201         | Thermodynamics & Heat Transfer | 4
          6 | Sneha Rao       | Computer Science       | CS201         | Data Structures & Algorithms   | 4
          6 | Sneha Rao       | Computer Science       | CS301         | Database Engineering           | 4
          7 | Vikram Malhotra | Electronics            | EC204         | Digital Electronics            | 3
          8 | Priya Nair      | Information Technology | NO ENROLLMENT | No Course Enrolled             | 0
          9 | Siddharth Verma | Mechanical             | NO ENROLLMENT | No Course Enrolled             | 0
         10 | Tanvi Kulkarni  | Civil                  | NO ENROLLMENT | No Course Enrolled             | 0
(17 rows)
```

---

### Query 12: Subquery Comparing Against Average Enrollment

#### SQL Code
```sql
SELECT 
    s.student_id,
    s.name,
    s.department,
    COUNT(e.course_id) AS enrolled_courses_count
FROM students s
INNER JOIN enrollments e ON s.student_id = e.student_id
GROUP BY s.student_id, s.name, s.department
HAVING COUNT(e.course_id) > (
    SELECT AVG(course_count)
    FROM (
        SELECT COUNT(course_id) AS course_count
        FROM enrollments
        GROUP BY student_id
    ) AS student_course_counts
)
ORDER BY enrolled_courses_count DESC, s.student_id ASC;
```

#### Purpose & Explanation
A multi-level analytical query. The inner subquery calculates each student's enrollment count and derives the system-wide average (14 enrollments / 7 enrolled students = 2.0 courses/student). The outer query uses `HAVING` to isolate students taking strictly more courses than the average (> 2.0).

#### Actual Execution Output
```text
 student_id |     name     |    department    | enrolled_courses_count 
------------+--------------+------------------+------------------------
          1 | Aarav Sharma | Computer Science |                      3
          3 | Rohan Iyer   | Computer Science |                      3
(2 rows)
```
