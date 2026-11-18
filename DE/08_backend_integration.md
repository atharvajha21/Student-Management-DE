# 08: Backend-Database Integration Guide

## 1. Architecture Overview

The **Student Management System** implements a clean 3-tier decoupled architecture:

```
[ Frontend: HTML5 / CSS3 / Vanilla JS ]
                 │
                 │ HTTP REST (JSON / Fetch API)
                 ▼
[ Application Layer: Express.js REST API ]
                 │
                 │ Prisma Query Engine (Type-Safe Node-API)
                 ▼
[ Object-Relational Mapping: Prisma Client ]
                 │
                 │ PostgreSQL Wire Protocol (libpq / TCP 5432)
                 ▼
[ Relational Engine: PostgreSQL 17 Database ]
```

---

## 2. Environment Configuration
The database connection string is isolated inside `.env` (which is excluded from Git version control via `.gitignore`):

```bash
# .env file
DATABASE_URL="postgresql://username:password@localhost:5432/student_management?schema=public"
PORT=3000
```

Inside `src/server.js`, `dotenv` loads this variable:
```javascript
const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```

---

## 3. Real Code Examples of Database Operations

### Example 1: Creating a Student with Unique Email Validation
```javascript
// POST /api/students
app.post('/api/students', async (req, res, next) => {
  try {
    const { name, email, phone, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and department are required fields.'
      });
    }

    // Check email uniqueness before insertion
    const existing = await prisma.student.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: `A student with email '${email.trim()}' already exists.`
      });
    }

    // Prisma creates tuple using parameterized queries
    const newStudent = await prisma.student.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        department: department.trim()
      }
    });

    res.status(201).json({ status: 'success', data: newStudent });
  } catch (error) {
    next(error);
  }
});
```

### Example 2: Multi-Table Relational Read (Students with Enrollments & Attendance)
```javascript
// GET /api/students/:id
app.get('/api/students/:id', async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    }

    // Performs optimized SQL JOIN under the hood
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
      return res.status(404).json({ status: 'error', message: 'Student not found.' });
    }

    res.json({ status: 'success', data: student });
  } catch (error) {
    next(error);
  }
});
```

### Example 3: Enforcing Domain Rules on Attendance Logging
```javascript
// POST /api/attendance
app.post('/api/attendance', async (req, res, next) => {
  try {
    const { enrollment_id, attendance_date, status } = req.body;
    const eId = parseInt(enrollment_id, 10);

    // Validate Status Domain (matches PostgreSQL CHECK constraint)
    if (!status || !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: "Status must be either 'Present' or 'Absent'."
      });
    }

    // Check for duplicate daily record
    const existing = await prisma.attendance.findUnique({
      where: {
        enrollment_id_attendance_date: {
          enrollment_id: eId,
          attendance_date: new Date(attendance_date)
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'Attendance already recorded for this enrollment on this date.'
      });
    }

    const record = await prisma.attendance.create({
      data: {
        enrollment_id: eId,
        attendance_date: new Date(attendance_date),
        status
      }
    });

    res.status(201).json({ status: 'success', data: record });
  } catch (error) {
    next(error);
  }
});
```

---

## 4. Centralized Error Mapping
Database exceptions thrown by PostgreSQL via Prisma are caught and translated into standardized HTTP status codes:

```javascript
app.use((err, req, res, next) => {
  // Prisma error P2002: Unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: 'A record with this unique identifier already exists.'
    });
  }

  // Prisma error P2003: Foreign key constraint violation
  if (err.code === 'P2003') {
    return res.status(400).json({
      status: 'error',
      message: 'Referenced foreign key entity does not exist.'
    });
  }

  res.status(500).json({ status: 'error', message: 'Internal server error.' });
});
```

---

## 5. Security & Query Safety
1. **No SQL Injection**: Prisma uses parameterized queries for every database interaction. User input is never concatenated directly into raw SQL strings.
2. **Credential Protection**: Database passwords and host strings are kept strictly in the local environment and never sent over API payloads or committed to Git.
