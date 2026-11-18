const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// -----------------------------------------------------------------------------
// DASHBOARD STATS API
// -----------------------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res, next) => {
  try {
    const [totalStudents, totalCourses, totalEnrollments, totalAttendance] = await Promise.all([
      prisma.student.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.attendance.count()
    ]);

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrollment_id: 'desc' },
      include: {
        student: { select: { name: true, department: true } },
        course: { select: { course_name: true, course_code: true } }
      }
    });

    res.json({
      status: 'success',
      data: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalAttendance,
        recentEnrollments
      }
    });
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// STUDENTS APIS
// -----------------------------------------------------------------------------

// GET /api/students - List all students (with optional department filter)
app.get('/api/students', async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const where = {};

    if (department && department.trim() !== '') {
      where.department = department.trim();
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { student_id: 'asc' },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    res.json({ status: 'success', data: students });
  } catch (error) {
    next(error);
  }
});

// GET /api/students/:id - Get a single student by ID with enrollments
app.get('/api/students/:id', async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid student ID parameter.' });
    }

    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
      include: {
        enrollments: {
          include: {
            course: true,
            attendances: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ status: 'error', message: `Student with ID ${studentId} not found.` });
    }

    res.json({ status: 'success', data: student });
  } catch (error) {
    next(error);
  }
});

// POST /api/students - Create a new student
app.post('/api/students', async (req, res, next) => {
  try {
    const { name, email, phone, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and department are required fields.'
      });
    }

    // Check email uniqueness
    const existing = await prisma.student.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: `A student with email '${email.trim()}' already exists.`
      });
    }

    const newStudent = await prisma.student.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        department: department.trim()
      }
    });

    res.status(201).json({ status: 'success', message: 'Student created successfully.', data: newStudent });
  } catch (error) {
    next(error);
  }
});

// PUT /api/students/:id - Update an existing student
app.put('/api/students/:id', async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid student ID parameter.' });
    }

    const { name, email, phone, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and department are required fields.'
      });
    }

    // Check if student exists
    const existing = await prisma.student.findUnique({
      where: { student_id: studentId }
    });

    if (!existing) {
      return res.status(404).json({ status: 'error', message: `Student with ID ${studentId} not found.` });
    }

    // Check if new email is already taken by another student
    if (email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailCollision = await prisma.student.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (emailCollision) {
        return res.status(409).json({
          status: 'error',
          message: `The email '${email.trim()}' is already used by another student.`
        });
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { student_id: studentId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        department: department.trim()
      }
    });

    res.json({ status: 'success', message: 'Student updated successfully.', data: updatedStudent });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/students/:id - Delete a student (cascades to enrollments and attendance)
app.delete('/api/students/:id', async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid student ID parameter.' });
    }

    const existing = await prisma.student.findUnique({
      where: { student_id: studentId }
    });

    if (!existing) {
      return res.status(404).json({ status: 'error', message: `Student with ID ${studentId} not found.` });
    }

    await prisma.student.delete({
      where: { student_id: studentId }
    });

    res.json({ status: 'success', message: `Student #${studentId} (${existing.name}) deleted successfully.` });
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// COURSES APIS
// -----------------------------------------------------------------------------

// GET /api/courses - List all courses
app.get('/api/courses', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { course_id: 'asc' },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    res.json({ status: 'success', data: courses });
  } catch (error) {
    next(error);
  }
});

// POST /api/courses - Create a new course
app.post('/api/courses', async (req, res, next) => {
  try {
    const { course_name, course_code, credits } = req.body;

    if (!course_name || !course_code || credits === undefined || credits === null) {
      return res.status(400).json({
        status: 'error',
        message: 'course_name, course_code, and credits are required.'
      });
    }

    const parsedCredits = parseInt(credits, 10);
    if (isNaN(parsedCredits) || parsedCredits < 1 || parsedCredits > 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Credits must be an integer between 1 and 6.'
      });
    }

    // Check course_code uniqueness
    const existing = await prisma.course.findUnique({
      where: { course_code: course_code.trim().toUpperCase() }
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: `Course with code '${course_code.trim().toUpperCase()}' already exists.`
      });
    }

    const newCourse = await prisma.course.create({
      data: {
        course_name: course_name.trim(),
        course_code: course_code.trim().toUpperCase(),
        credits: parsedCredits
      }
    });

    res.status(201).json({ status: 'success', message: 'Course created successfully.', data: newCourse });
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// ENROLLMENTS APIS
// -----------------------------------------------------------------------------

// GET /api/enrollments - List all enrollments with student and course details
app.get('/api/enrollments', async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { enrollment_id: 'asc' },
      include: {
        student: {
          select: { student_id: true, name: true, email: true, department: true }
        },
        course: {
          select: { course_id: true, course_name: true, course_code: true, credits: true }
        },
        _count: {
          select: { attendances: true }
        }
      }
    });

    res.json({ status: 'success', data: enrollments });
  } catch (error) {
    next(error);
  }
});

// POST /api/enrollments - Enroll a student into a course
app.post('/api/enrollments', async (req, res, next) => {
  try {
    const { student_id, course_id, enrollment_date } = req.body;

    const sId = parseInt(student_id, 10);
    const cId = parseInt(course_id, 10);

    if (isNaN(sId) || isNaN(cId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid student_id and course_id integers are required.'
      });
    }

    // Validate that student exists
    const student = await prisma.student.findUnique({ where: { student_id: sId } });
    if (!student) {
      return res.status(404).json({ status: 'error', message: `Student with ID ${sId} not found.` });
    }

    // Validate that course exists
    const course = await prisma.course.findUnique({ where: { course_id: cId } });
    if (!course) {
      return res.status(404).json({ status: 'error', message: `Course with ID ${cId} not found.` });
    }

    // Check for duplicate enrollment (student_id + course_id UNIQUE)
    const existing = await prisma.enrollment.findUnique({
      where: {
        student_id_course_id: { student_id: sId, course_id: cId }
      }
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: `Student '${student.name}' is already enrolled in course '${course.course_code}'.`
      });
    }

    const data = {
      student_id: sId,
      course_id: cId
    };

    if (enrollment_date) {
      data.enrollment_date = new Date(enrollment_date);
    }

    const newEnrollment = await prisma.enrollment.create({
      data,
      include: {
        student: true,
        course: true
      }
    });

    res.status(201).json({ status: 'success', message: 'Student successfully enrolled.', data: newEnrollment });
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// ATTENDANCE APIS
// -----------------------------------------------------------------------------

// GET /api/attendance - List all attendance records with details
app.get('/api/attendance', async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const where = {};

    if (date) {
      where.attendance_date = new Date(date);
    }

    if (status && ['Present', 'Absent'].includes(status)) {
      where.status = status;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      orderBy: [
        { attendance_date: 'desc' },
        { attendance_id: 'asc' }
      ],
      include: {
        enrollment: {
          include: {
            student: { select: { student_id: true, name: true, department: true } },
            course: { select: { course_id: true, course_name: true, course_code: true } }
          }
        }
      }
    });

    res.json({ status: 'success', data: attendanceRecords });
  } catch (error) {
    next(error);
  }
});

// POST /api/attendance - Mark attendance for an enrollment
app.post('/api/attendance', async (req, res, next) => {
  try {
    const { enrollment_id, attendance_date, status } = req.body;

    const eId = parseInt(enrollment_id, 10);
    if (isNaN(eId)) {
      return res.status(400).json({ status: 'error', message: 'Valid enrollment_id is required.' });
    }

    if (!attendance_date) {
      return res.status(400).json({ status: 'error', message: 'attendance_date (YYYY-MM-DD) is required.' });
    }

    if (!status || !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: "Status must be either 'Present' or 'Absent'."
      });
    }

    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: eId },
      include: { student: true, course: true }
    });

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: `Enrollment with ID ${eId} not found.`
      });
    }

    const parsedDate = new Date(attendance_date);

    // Check duplicate attendance for the same enrollment on the same date
    const existing = await prisma.attendance.findUnique({
      where: {
        enrollment_id_attendance_date: {
          enrollment_id: eId,
          attendance_date: parsedDate
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: `Attendance for enrollment #${eId} on ${attendance_date} has already been recorded.`
      });
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        enrollment_id: eId,
        attendance_date: parsedDate,
        status
      },
      include: {
        enrollment: {
          include: { student: true, course: true }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Attendance recorded successfully.',
      data: newAttendance
    });
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// CENTRALIZED ERROR HANDLER
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: `A database record with this unique field already exists. (${err.meta?.target || 'unique constraint'})`
    });
  }

  // Prisma Foreign Key Constraint Violation
  if (err.code === 'P2003') {
    return res.status(400).json({
      status: 'error',
      message: 'Referenced foreign key entity does not exist in the database.'
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error occurred.'
  });
});

// Start Express Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Student Management System Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 Database: PostgreSQL (student_management via Prisma)`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, prisma };
