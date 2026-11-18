/**
 * Verification Script: Automated End-to-End Verification
 * Verifies dynamic dashboard stats, CRUD operations, PostgreSQL persistence, and cascading rules.
 */

const { app, prisma } = require('../src/server');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

async function verify() {
  console.log('===========================================================');
  console.log('   FULL PROJECT VERIFICATION: API & POSTGRESQL PERSISTENCE  ');
  console.log('===========================================================');

  let server;
  const results = [];

  function record(stepName, passed, details) {
    results.push({ stepName, passed, details });
    if (passed) {
      console.log(`✅ [PASS] ${stepName}: ${details}`);
    } else {
      console.error(`❌ [FAIL] ${stepName}: ${details}`);
    }
  }

  try {
    // 0. Start test server
    await new Promise(resolve => {
      server = app.listen(PORT, () => resolve());
    });
    console.log(`Server started on ${BASE_URL}`);

    // --- STEP 4: VERIFY DYNAMIC DASHBOARD STATS ---
    console.log('\n--- Checking Step 4: Dynamic Dashboard Stats ---');
    const statsRes1 = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const statsData1 = await statsRes1.json();
    const initStudents = statsData1.data.totalStudents;
    const initCourses = statsData1.data.totalCourses;
    const initEnrollments = statsData1.data.totalEnrollments;
    const initAttendance = statsData1.data.totalAttendance;

    record('Initial Dashboard Stats', 
      initStudents === 10 && initCourses === 5 && initEnrollments === 14 && initAttendance === 18,
      `Reported: Students=${initStudents}, Courses=${initCourses}, Enrollments=${initEnrollments}, Attendance=${initAttendance}`
    );

    // --- STEP 5: ADD, VIEW, UPDATE, DELETE STUDENTS ---
    console.log('\n--- Checking Step 5 & 8: Student Lifecycle in PostgreSQL ---');
    
    // Add student
    const addStudentRes = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Rampal',
        email: 'arjun.rampal@university.edu',
        phone: '9811223344',
        department: 'Artificial Intelligence'
      })
    });
    const addStudentData = await addStudentRes.json();
    const createdStudentId = addStudentData.data?.student_id;

    record('Add Student API', addStudentRes.status === 201 && createdStudentId > 0, `Created Student ID #${createdStudentId}`);

    // Verify row directly in PostgreSQL via raw query
    const pgStudent = await prisma.$queryRawUnsafe(
      'SELECT * FROM students WHERE student_id = $1', createdStudentId
    );
    record('Verify Student in PostgreSQL', pgStudent.length === 1 && pgStudent[0].email === 'arjun.rampal@university.edu', 
      `Direct PostgreSQL query found student: ${pgStudent[0]?.name} (${pgStudent[0]?.department})`
    );

    // Verify dashboard reflects addition dynamically
    const statsRes2 = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const statsData2 = await statsRes2.json();
    record('Dynamic Stats Increase', statsData2.data.totalStudents === initStudents + 1, 
      `Total students dynamically increased to ${statsData2.data.totalStudents} (proves NOT hardcoded)`
    );

    // View student
    const viewStudentRes = await fetch(`${BASE_URL}/api/students/${createdStudentId}`);
    const viewStudentData = await viewStudentRes.json();
    record('View Student by ID', viewStudentRes.status === 200 && viewStudentData.data.name === 'Arjun Rampal', 
      `Fetched name: ${viewStudentData.data?.name}`
    );

    // Update student
    const updateStudentRes = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun K. Rampal',
        email: 'arjun.rampal@university.edu',
        phone: '9900112233',
        department: 'Data Science'
      })
    });
    const updateStudentData = await updateStudentRes.json();
    record('Update Student API', updateStudentRes.status === 200, `Updated student status: ${updateStudentData.status}`);

    // Verify update in PostgreSQL
    const pgUpdatedStudent = await prisma.$queryRawUnsafe(
      'SELECT * FROM students WHERE student_id = $1', createdStudentId
    );
    record('Verify Update in PostgreSQL', pgUpdatedStudent[0]?.name === 'Arjun K. Rampal' && pgUpdatedStudent[0]?.department === 'Data Science', 
      `Direct PostgreSQL check: Name="${pgUpdatedStudent[0]?.name}", Dept="${pgUpdatedStudent[0]?.department}"`
    );

    // --- STEP 6: ADD COURSES & ENROLL STUDENTS ---
    console.log('\n--- Checking Step 6 & 8: Course & Enrollment in PostgreSQL ---');
    const addCourseRes = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_name: 'Machine Learning Pipelines',
        course_code: 'CS410',
        credits: 4
      })
    });
    const addCourseData = await addCourseRes.json();
    const createdCourseId = addCourseData.data?.course_id;
    record('Add Course API', addCourseRes.status === 201 && createdCourseId > 0, `Created Course ID #${createdCourseId} (${addCourseData.data?.course_code})`);

    // Verify course in PostgreSQL
    const pgCourse = await prisma.$queryRawUnsafe(
      'SELECT * FROM courses WHERE course_id = $1', createdCourseId
    );
    record('Verify Course in PostgreSQL', pgCourse.length === 1 && pgCourse[0].course_code === 'CS410', 
      `Direct PostgreSQL check found course "${pgCourse[0]?.course_name}"`
    );

    // Enroll student in new course
    const enrollRes = await fetch(`${BASE_URL}/api/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: createdStudentId,
        course_id: createdCourseId,
        enrollment_date: '2026-11-18'
      })
    });
    const enrollData = await enrollRes.json();
    const createdEnrollmentId = enrollData.data?.enrollment_id;
    record('Enroll Student API', enrollRes.status === 201 && createdEnrollmentId > 0, `Created Enrollment ID #${createdEnrollmentId}`);

    // Verify enrollment in PostgreSQL
    const pgEnroll = await prisma.$queryRawUnsafe(
      'SELECT * FROM enrollments WHERE enrollment_id = $1', createdEnrollmentId
    );
    record('Verify Enrollment in PostgreSQL', pgEnroll.length === 1 && pgEnroll[0].student_id === createdStudentId, 
      `Direct PostgreSQL check found enrollment #${pgEnroll[0]?.enrollment_id}`
    );

    // --- STEP 7: RECORD ATTENDANCE ---
    console.log('\n--- Checking Step 7 & 8: Attendance in PostgreSQL ---');
    const attendRes = await fetch(`${BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollment_id: createdEnrollmentId,
        attendance_date: '2026-11-18',
        status: 'Present'
      })
    });
    const attendData = await attendRes.json();
    const createdAttendId = attendData.data?.attendance_id;
    record('Record Attendance API', attendRes.status === 201 && createdAttendId > 0, `Created Attendance ID #${createdAttendId}`);

    // Verify attendance in PostgreSQL
    const pgAttend = await prisma.$queryRawUnsafe(
      'SELECT * FROM attendance WHERE attendance_id = $1', createdAttendId
    );
    record('Verify Attendance in PostgreSQL', pgAttend.length === 1 && pgAttend[0].status === 'Present', 
      `Direct PostgreSQL check found attendance record: status="${pgAttend[0]?.status}"`
    );

    // --- STEP 5 (cont): TEST DELETE STUDENT & CASCADING IN POSTGRESQL ---
    console.log('\n--- Checking Cascading Deletion in PostgreSQL ---');
    const deleteStudentRes = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
      method: 'DELETE'
    });
    record('Delete Student API', deleteStudentRes.status === 200, `Deleted Student #${createdStudentId}`);

    // Verify student is gone from PostgreSQL
    const pgStudentAfter = await prisma.$queryRawUnsafe(
      'SELECT * FROM students WHERE student_id = $1', createdStudentId
    );
    record('Verify Student Purged in PostgreSQL', pgStudentAfter.length === 0, 'Student row no longer exists');

    // Verify CASCADE: enrollment must be deleted automatically
    const pgEnrollAfter = await prisma.$queryRawUnsafe(
      'SELECT * FROM enrollments WHERE enrollment_id = $1', createdEnrollmentId
    );
    record('Verify Enrollment Cascaded in PostgreSQL', pgEnrollAfter.length === 0, 'Child enrollment deleted via ON DELETE CASCADE');

    // Verify CASCADE: attendance must be deleted automatically
    const pgAttendAfter = await prisma.$queryRawUnsafe(
      'SELECT * FROM attendance WHERE attendance_id = $1', createdAttendId
    );
    record('Verify Attendance Cascaded in PostgreSQL', pgAttendAfter.length === 0, 'Grandchild attendance deleted via ON DELETE CASCADE');

    // Clean up temporary test course
    await prisma.$queryRawUnsafe('DELETE FROM courses WHERE course_id = $1', createdCourseId);

    // Check stats returned to baseline
    const statsResFinal = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const statsDataFinal = await statsResFinal.json();
    record('Dynamic Stats Reset to Baseline', 
      statsDataFinal.data.totalStudents === initStudents && statsDataFinal.data.totalCourses === initCourses,
      `Returned to baseline counts (Students=${statsDataFinal.data.totalStudents}, Courses=${statsDataFinal.data.totalCourses})`
    );

  } catch (err) {
    console.error('Fatal Verification Error:', err);
    record('Verification Execution', false, err.message);
  } finally {
    await prisma.$disconnect();
    if (server) server.close();
    console.log('\n===========================================================');
    const totalPassed = results.filter(r => r.passed).length;
    const totalFailed = results.filter(r => !r.passed).length;
    console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
    console.log('===========================================================');
    if (totalFailed > 0) process.exit(1);
  }
}

verify();
