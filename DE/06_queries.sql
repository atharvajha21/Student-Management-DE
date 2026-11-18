-- =============================================================================
-- Student Management System - Data Engineering Project
-- File: DE/06_queries.sql
-- Description: 12 Meaningful SQL Queries demonstrating essential SQL concepts:
-- DDL/DML, Filtering, Sorting, Aggregations, Grouping, Having, Joins, Subqueries.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Query 01: INSERT a student record safely
-- Concept: Data Manipulation Language (DML) - INSERT with RETURNING clause
-- Purpose: Adds a new student record. Uses a transaction with ROLLBACK to keep sample data intact.
-- -----------------------------------------------------------------------------
BEGIN;
INSERT INTO students (name, email, phone, department)
VALUES ('Kavya Deshmukh', 'kavya.deshmukh@example.edu', '9876543220', 'Computer Science')
RETURNING student_id, name, email, department, created_at;
ROLLBACK;

-- -----------------------------------------------------------------------------
-- Query 02: SELECT all students
-- Concept: Basic Projection & Table Scan
-- Purpose: Retrieves all student records with all attributes, ordered by primary key.
-- -----------------------------------------------------------------------------
SELECT student_id, name, email, phone, department, created_at
FROM students
ORDER BY student_id ASC;

-- -----------------------------------------------------------------------------
-- Query 03: WHERE clause filtering students by department
-- Concept: Predicate Filtering
-- Purpose: Finds all students belonging to the 'Computer Science' department.
-- -----------------------------------------------------------------------------
SELECT student_id, name, email, department
FROM students
WHERE department = 'Computer Science'
ORDER BY student_id ASC;

-- -----------------------------------------------------------------------------
-- Query 04: ORDER BY students alphabetically
-- Concept: Result Set Sorting
-- Purpose: Sorts all students alphabetically in ascending order by name.
-- -----------------------------------------------------------------------------
SELECT student_id, name, email, department
FROM students
ORDER BY name ASC;

-- -----------------------------------------------------------------------------
-- Query 05: UPDATE student information
-- Concept: DML UPDATE with condition
-- Purpose: Updates the phone and department for student Aarav Sharma inside a safe transaction.
-- -----------------------------------------------------------------------------
BEGIN;
UPDATE students
SET phone = '9999988888', department = 'Data Science'
WHERE email = 'aarav.sharma@example.edu'
RETURNING student_id, name, email, phone, department;
ROLLBACK;

-- -----------------------------------------------------------------------------
-- Query 06: DELETE a student safely
-- Concept: DML DELETE with condition & transaction safety
-- Purpose: Inserts a temporary student and safely deletes it, demonstrating atomic deletion.
-- -----------------------------------------------------------------------------
BEGIN;
INSERT INTO students (name, email, phone, department)
VALUES ('Temporary Test Student', 'temp.student@example.edu', '9000000000', 'Civil');

DELETE FROM students
WHERE email = 'temp.student@example.edu'
RETURNING student_id, name, email;
ROLLBACK;

-- -----------------------------------------------------------------------------
-- Query 07: COUNT total students
-- Concept: Aggregate Function (COUNT)
-- Purpose: Computes the total number of registered students in the system.
-- -----------------------------------------------------------------------------
SELECT COUNT(*) AS total_students
FROM students;

-- -----------------------------------------------------------------------------
-- Query 08: GROUP BY to count students per course
-- Concept: Aggregation with GROUP BY and LEFT JOIN
-- Purpose: Counts total enrolled students for each course, including courses with 0 enrollments.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Query 09: HAVING clause to find courses with more than one student
-- Concept: Post-Aggregation Filtering (HAVING)
-- Purpose: Filters courses that have strictly more than 1 enrolled student.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Query 10: INNER JOIN to display students and their enrolled courses
-- Concept: Multi-table relational INNER JOIN
-- Purpose: Displays detailed list of student enrollments joining students, enrollments, and courses.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Query 11: LEFT JOIN to display all students, including those without enrollments
-- Concept: Relational Outer Join (LEFT OUTER JOIN)
-- Purpose: Demonstrates how non-matching rows (Student 10 Tanvi Kulkarni) are preserved.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Query 12: Subquery to find students enrolled in more courses than the average
-- Concept: Subquery / Nested Aggregate Comparison
-- Purpose: Identifies high-workload students whose enrollment count exceeds the average.
-- -----------------------------------------------------------------------------
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
