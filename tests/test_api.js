/**
 * End-to-End API Integration Test Suite
 * Tests all Express routes, Prisma queries, constraints, validations, and status codes.
 */

const { app, prisma } = require('../src/server');
const http = require('http');

let server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('--- Starting API Integration Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Start temporary test server
  await new Promise(resolve => {
    server = app.listen(PORT, () => {
      console.log(`Test server listening on port ${PORT}`);
      resolve();
    });
  });

  try {
    // 1. Dashboard Stats
    console.log('\n[1] Testing GET /api/dashboard/stats');
    const resStats = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const dataStats = await resStats.json();
    assert(resStats.status === 200, 'Returns 200 OK');
    assert(dataStats.data.totalStudents === 10, 'Total students count is 10');
    assert(dataStats.data.totalCourses === 5, 'Total courses count is 5');
    assert(dataStats.data.totalEnrollments === 14, 'Total enrollments count is 14');
    assert(dataStats.data.totalAttendance === 18, 'Total attendance count is 18');

    // 2. GET /api/students
    console.log('\n[2] Testing GET /api/students');
    const resStudents = await fetch(`${BASE_URL}/api/students`);
    const dataStudents = await resStudents.json();
    assert(resStudents.status === 200, 'Returns 200 OK');
    assert(dataStudents.data.length === 10, 'Returns 10 students');

    // 2b. Filter by department
    const resDept = await fetch(`${BASE_URL}/api/students?department=Computer%20Science`);
    const dataDept = await resDept.json();
    assert(dataDept.data.length === 3, 'Returns 3 Computer Science students');

    // 3. GET /api/students/:id
    console.log('\n[3] Testing GET /api/students/1');
    const resStudent1 = await fetch(`${BASE_URL}/api/students/1`);
    const dataStudent1 = await resStudent1.json();
    assert(resStudent1.status === 200, 'Returns 200 OK');
    assert(dataStudent1.data.name === 'Aarav Sharma', 'Student 1 is Aarav Sharma');
    assert(dataStudent1.data.enrollments.length === 3, 'Aarav has 3 enrollments');

    // 4. POST /api/students (Create, duplicate rejection)
    console.log('\n[4] Testing POST /api/students');
    const resCreateStudent = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test Student',
        email: 'integration.test@example.edu',
        phone: '1122334455',
        department: 'Electronics'
      })
    });
    const dataCreateStudent = await resCreateStudent.json();
    assert(resCreateStudent.status === 201, 'Student created with status 201');
    const testStudentId = dataCreateStudent.data.student_id;

    // Test Duplicate Email Rejection (Unique Constraint)
    const resDupStudent = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Student',
        email: 'integration.test@example.edu',
        department: 'Civil'
      })
    });
    assert(resDupStudent.status === 409, 'Duplicate email rejected with status 409 Conflict');

    // 5. PUT /api/students/:id
    console.log('\n[5] Testing PUT /api/students/:id');
    const resUpdate = await fetch(`${BASE_URL}/api/students/${testStudentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Integration Student',
        email: 'integration.test@example.edu',
        phone: '9988776655',
        department: 'Information Technology'
      })
    });
    const dataUpdate = await resUpdate.json();
    assert(resUpdate.status === 200, 'Returns 200 OK on update');
    assert(dataUpdate.data.phone === '9988776655', 'Phone updated correctly');

    // 6. DELETE /api/students/:id
    console.log('\n[6] Testing DELETE /api/students/:id');
    const resDelete = await fetch(`${BASE_URL}/api/students/${testStudentId}`, { method: 'DELETE' });
    assert(resDelete.status === 200, 'Student deleted with 200 OK');

    // Verify deletion
    const resCheckDel = await fetch(`${BASE_URL}/api/students/${testStudentId}`);
    assert(resCheckDel.status === 404, 'Deleted student returns 404 Not Found');

    // 7. GET /api/courses
    console.log('\n[7] Testing GET /api/courses');
    const resCourses = await fetch(`${BASE_URL}/api/courses`);
    const dataCourses = await resCourses.json();
    assert(resCourses.status === 200, 'Returns 200 OK');
    assert(dataCourses.data.length === 5, 'Returns 5 courses');

    // 8. POST /api/courses (Valid, Invalid credits CHECK constraint, Duplicate code)
    console.log('\n[8] Testing POST /api/courses validation');
    const resInvalidCredits = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_name: 'Invalid Course',
        course_code: 'BAD101',
        credits: 10 // Invalid: > 6
      })
    });
    assert(resInvalidCredits.status === 400, 'Invalid credits rejected with 400 Bad Request');

    const resDupCourse = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_name: 'Duplicate Code Course',
        course_code: 'CS301', // Already exists
        credits: 4
      })
    });
    assert(resDupCourse.status === 409, 'Duplicate course_code rejected with 409 Conflict');

    // 9. GET & POST /api/enrollments
    console.log('\n[9] Testing Enrollments API');
    const resEnrollments = await fetch(`${BASE_URL}/api/enrollments`);
    const dataEnrollments = await resEnrollments.json();
    assert(resEnrollments.status === 200, 'Returns 200 OK');
    assert(dataEnrollments.data.length === 14, 'Returns 14 enrollments');

    // Test duplicate enrollment rejection (Student 1 already in Course 1)
    const resDupEnroll = await fetch(`${BASE_URL}/api/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 1,
        course_id: 1
      })
    });
    assert(resDupEnroll.status === 409, 'Duplicate enrollment rejected with 409 Conflict');

    // 10. GET & POST /api/attendance
    console.log('\n[10] Testing Attendance API');
    const resAttend = await fetch(`${BASE_URL}/api/attendance`);
    const dataAttend = await resAttend.json();
    assert(resAttend.status === 200, 'Returns 200 OK');
    assert(dataAttend.data.length === 18, 'Returns 18 attendance records');

    // Test invalid status CHECK rejection
    const resBadStatus = await fetch(`${BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollment_id: 1,
        attendance_date: '2026-11-20',
        status: 'Late' // Invalid, must be Present or Absent
      })
    });
    assert(resBadStatus.status === 400, 'Invalid status rejected with 400 Bad Request');

    // Test duplicate daily attendance rejection (Enrollment 1 on 2026-11-03 already logged)
    const resDupAttend = await fetch(`${BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollment_id: 1,
        attendance_date: '2026-11-03',
        status: 'Present'
      })
    });
    assert(resDupAttend.status === 409, 'Duplicate daily attendance rejected with 409 Conflict');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
    server.close();
    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    if (failed > 0) process.exit(1);
  }
}

runTests();
