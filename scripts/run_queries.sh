#!/bin/bash
set -e

PSQL="/opt/homebrew/opt/postgresql@17/bin/psql -h localhost -U atharvajha -d student_management"

echo "Running Query 01..."
$PSQL -c "BEGIN; INSERT INTO students (name, email, phone, department) VALUES ('Kavya Deshmukh', 'kavya.deshmukh@example.edu', '9876543220', 'Computer Science') RETURNING student_id, name, email, department, created_at; ROLLBACK;" > DE/07_query_outputs/query_01.txt

echo "Running Query 02..."
$PSQL -c "SELECT student_id, name, email, phone, department, created_at FROM students ORDER BY student_id ASC;" > DE/07_query_outputs/query_02.txt

echo "Running Query 03..."
$PSQL -c "SELECT student_id, name, email, department FROM students WHERE department = 'Computer Science' ORDER BY student_id ASC;" > DE/07_query_outputs/query_03.txt

echo "Running Query 04..."
$PSQL -c "SELECT student_id, name, email, department FROM students ORDER BY name ASC;" > DE/07_query_outputs/query_04.txt

echo "Running Query 05..."
$PSQL -c "BEGIN; UPDATE students SET phone = '9999988888', department = 'Data Science' WHERE email = 'aarav.sharma@example.edu' RETURNING student_id, name, email, phone, department; ROLLBACK;" > DE/07_query_outputs/query_05.txt

echo "Running Query 06..."
$PSQL -c "BEGIN; INSERT INTO students (name, email, phone, department) VALUES ('Temporary Test Student', 'temp.student@example.edu', '9000000000', 'Civil'); DELETE FROM students WHERE email = 'temp.student@example.edu' RETURNING student_id, name, email; ROLLBACK;" > DE/07_query_outputs/query_06.txt

echo "Running Query 07..."
$PSQL -c "SELECT COUNT(*) AS total_students FROM students;" > DE/07_query_outputs/query_07.txt

echo "Running Query 08..."
$PSQL -c "SELECT c.course_id, c.course_name, c.course_code, c.credits, COUNT(e.student_id) AS enrolled_students_count FROM courses c LEFT JOIN enrollments e ON c.course_id = e.course_id GROUP BY c.course_id, c.course_name, c.course_code, c.credits ORDER BY enrolled_students_count DESC, c.course_id ASC;" > DE/07_query_outputs/query_08.txt

echo "Running Query 09..."
$PSQL -c "SELECT c.course_id, c.course_name, c.course_code, COUNT(e.student_id) AS enrolled_count FROM courses c INNER JOIN enrollments e ON c.course_id = e.course_id GROUP BY c.course_id, c.course_name, c.course_code HAVING COUNT(e.student_id) > 1 ORDER BY enrolled_count DESC;" > DE/07_query_outputs/query_09.txt

echo "Running Query 10..."
$PSQL -c "SELECT s.student_id, s.name AS student_name, s.department, c.course_code, c.course_name, c.credits, e.enrollment_date FROM students s INNER JOIN enrollments e ON s.student_id = e.student_id INNER JOIN courses c ON e.course_id = c.course_id ORDER BY s.student_id ASC, c.course_code ASC;" > DE/07_query_outputs/query_10.txt

echo "Running Query 11..."
$PSQL -c "SELECT s.student_id, s.name AS student_name, s.department, COALESCE(c.course_code, 'NO ENROLLMENT') AS course_code, COALESCE(c.course_name, 'No Course Enrolled') AS course_name, COALESCE(c.credits::text, '0') AS credits FROM students s LEFT JOIN enrollments e ON s.student_id = e.student_id LEFT JOIN courses c ON e.course_id = c.course_id ORDER BY s.student_id ASC, c.course_code ASC NULLS FIRST;" > DE/07_query_outputs/query_11.txt

echo "Running Query 12..."
$PSQL -c "SELECT s.student_id, s.name, s.department, COUNT(e.course_id) AS enrolled_courses_count FROM students s INNER JOIN enrollments e ON s.student_id = e.student_id GROUP BY s.student_id, s.name, s.department HAVING COUNT(e.course_id) > (SELECT AVG(course_count) FROM (SELECT COUNT(course_id) AS course_count FROM enrollments GROUP BY student_id) AS student_course_counts) ORDER BY enrolled_courses_count DESC, s.student_id ASC;" > DE/07_query_outputs/query_12.txt

echo "All 12 queries executed successfully!"
