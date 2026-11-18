-- =============================================================================
-- Student Management System - Data Engineering Project
-- File: DE/05_sample_data.sql
-- Description: Realistic fictional sample dataset for 4 relational tables.
-- Contains: 10 Students, 5 Courses, 14 Enrollments, and 18 Attendance records.
-- =============================================================================

-- Clear existing data if any (in reverse dependency order)
TRUNCATE TABLE attendance, enrollments, courses, students RESTART IDENTITY CASCADE;

-- 1. INSERT 10 STUDENTS
-- Demonstrates multiple departments, with Student 10 having no enrollments for LEFT JOIN demo.
INSERT INTO students (name, email, phone, department, created_at) VALUES
('Aarav Sharma',      'aarav.sharma@example.edu',      '9876543210', 'Computer Science',        '2026-08-01 09:30:00'),
('Diya Patel',        'diya.patel@example.edu',        '9876543211', 'Information Technology', '2026-08-01 10:15:00'),
('Rohan Iyer',        'rohan.iyer@example.edu',        '9876543212', 'Computer Science',        '2026-08-02 11:00:00'),
('Ananya Gupta',      'ananya.gupta@example.edu',      '9876543213', 'Electronics',             '2026-08-02 11:45:00'),
('Kabir Mehta',       'kabir.mehta@example.edu',       '9876543214', 'Mechanical',              '2026-08-03 14:00:00'),
('Sneha Rao',         'sneha.rao@example.edu',         '9876543215', 'Computer Science',        '2026-08-03 14:30:00'),
('Vikram Malhotra',   'vikram.malhotra@example.edu',   '9876543216', 'Electronics',             '2026-08-04 15:15:00'),
('Priya Nair',        'priya.nair@example.edu',        '9876543217', 'Information Technology', '2026-08-04 16:00:00'),
('Siddharth Verma',   'siddharth.verma@example.edu',   '9876543218', 'Mechanical',              '2026-08-05 09:00:00'),
('Tanvi Kulkarni',    'tanvi.kulkarni@example.edu',    '9876543219', 'Civil',                   '2026-08-05 10:30:00');

-- 2. INSERT 5 COURSES
-- Credits between 1 and 6, satisfying CHECK (credits >= 1 AND credits <= 6)
INSERT INTO courses (course_name, course_code, credits) VALUES
('Database Engineering',           'CS301', 4),
('Data Structures & Algorithms',    'CS201', 4),
('Web Application Development',     'IT302', 3),
('Digital Electronics',             'EC204', 3),
('Thermodynamics & Heat Transfer',  'ME201', 4);

-- 3. INSERT 14 ENROLLMENTS
-- Demonstrates Many-to-Many junction between students and courses
INSERT INTO enrollments (student_id, course_id, enrollment_date) VALUES
(1, 1, '2026-08-10'), -- Aarav -> Database Engineering
(1, 2, '2026-08-10'), -- Aarav -> DSA
(1, 3, '2026-08-11'), -- Aarav -> Web App Dev
(2, 1, '2026-08-10'), -- Diya  -> Database Engineering
(2, 3, '2026-08-11'), -- Diya  -> Web App Dev
(3, 1, '2026-08-10'), -- Rohan -> Database Engineering
(3, 2, '2026-08-11'), -- Rohan -> DSA
(3, 3, '2026-08-12'), -- Rohan -> Web App Dev
(4, 1, '2026-08-10'), -- Ananya -> Database Engineering
(4, 4, '2026-08-11'), -- Ananya -> Digital Electronics
(5, 5, '2026-08-12'), -- Kabir -> Thermodynamics
(6, 1, '2026-08-10'), -- Sneha -> Database Engineering
(6, 2, '2026-08-11'), -- Sneha -> DSA
(7, 4, '2026-08-12'); -- Vikram -> Digital Electronics

-- 4. INSERT 18 ATTENDANCE RECORDS
-- Satisfying CHECK (status IN ('Present', 'Absent')) and UNIQUE(enrollment_id, attendance_date)
INSERT INTO attendance (enrollment_id, attendance_date, status) VALUES
-- Attendance on 2026-11-03
(1,  '2026-11-03', 'Present'), -- Aarav (CS301)
(2,  '2026-11-03', 'Present'), -- Aarav (CS201)
(3,  '2026-11-03', 'Absent'),  -- Aarav (IT302)
(4,  '2026-11-03', 'Present'), -- Diya (CS301)
(5,  '2026-11-03', 'Present'), -- Diya (IT302)
(6,  '2026-11-03', 'Present'), -- Rohan (CS301)
(7,  '2026-11-03', 'Present'), -- Rohan (CS201)
(8,  '2026-11-03', 'Present'), -- Rohan (IT302)
(9,  '2026-11-03', 'Present'), -- Ananya (CS301)
(10, '2026-11-03', 'Present'), -- Ananya (EC204)
(11, '2026-11-03', 'Absent'),  -- Kabir (ME201)
(12, '2026-11-03', 'Present'), -- Sneha (CS301)
(13, '2026-11-03', 'Present'), -- Sneha (CS201)
(14, '2026-11-03', 'Present'), -- Vikram (EC204)

-- Attendance on 2026-11-04
(1,  '2026-11-04', 'Present'), -- Aarav (CS301)
(4,  '2026-11-04', 'Absent'),  -- Diya (CS301)
(6,  '2026-11-04', 'Present'), -- Rohan (CS301)
(9,  '2026-11-04', 'Present'); -- Ananya (CS301)
