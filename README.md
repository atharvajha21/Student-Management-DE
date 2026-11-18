# Student Management System — Data Engineering (DE) Project

An end-to-end, production-grade academic database system built with **PostgreSQL 17**, **Node.js (CommonJS)**, **Express.js**, and **Prisma ORM**, featuring a responsive **HTML5/Vanilla JavaScript** management dashboard.

Developed strictly to satisfy the complete **Data Engineering (DE)** academic curriculum requirements: 3NF normalization, relational modeling, referential integrity cascades, domain constraints, B-Tree performance indexing, 12 verified SQL analytical queries, and RESTful API integration.

---

## 🌟 Key Features

1. **Normalized Relational Schema (3NF):** Zero redundancy across four core domain entities: Students, Courses, Enrollments, and Attendance.
2. **Referential Integrity & Cascades:** `ON DELETE CASCADE` on all foreign key relations eliminates orphan records.
3. **Domain Constraints:**
   - `CHECK (credits >= 1 AND credits <= 6)` on courses.
   - `CHECK (status IN ('Present', 'Absent'))` on attendance.
   - `UNIQUE (email)` on students and `UNIQUE (course_code)` on courses.
   - Composite `UNIQUE (student_id, course_id)` preventing duplicate student enrollments.
   - Composite `UNIQUE (enrollment_id, attendance_date)` preventing multiple daily attendance logs.
4. **Performance B-Tree Indexing:** Dedicated indexes on foreign keys and search columns (`department`, `student_id`, `course_id`, `enrollment_id`).
5. **12 Executed SQL Queries:** DML, aggregations, multi-table `INNER JOIN`, `LEFT JOIN`, `GROUP BY`, `HAVING`, and nested subqueries with verified terminal outputs.
6. **Full-Stack REST API:** Complete CRUD endpoints in Express.js with parameter validation, error mapping, and HTTP status codes (200, 201, 400, 404, 409).
7. **Responsive Modern UI:** Single-page dashboard built with HTML5, CSS3, and Vanilla JavaScript using browser Fetch API.
8. **Comprehensive Viva Dossier:** Complete documentation folder (`DE/`) containing 38 viva questions & answers, diagrams, and a 2-minute viva presentation speech.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Database** | PostgreSQL 17 | Relational database engine, ACID transactions, constraint checks |
| **Runtime** | Node.js (v24.x LTS) | Server-side JavaScript runtime (CommonJS) |
| **Backend Framework** | Express.js (v5.x) | REST API routing, request validation, static asset serving |
| **Data Layer / ORM** | Prisma ORM (v6.x) | Type-safe queries, migration engine, connection pooling |
| **Frontend UI** | HTML5, CSS3, Vanilla JS | Responsive client dashboard, Fetch API integration |
| **Image Rendering** | Sharp | High-resolution ER diagram compilation |

---

## 📂 Project Structure

```text
Student-Management-DE/
├── DE/                                     # Complete College DE Submission Dossier
│   ├── 01_database_selection.md            # RDBMS & PostgreSQL selection justification
│   ├── 02_er_diagram.mmd                   # Mermaid ER diagram source
│   ├── 02_er_diagram.png                   # High-resolution ER diagram image
│   ├── 02_er_diagram.svg                   # Vector ER diagram
│   ├── 03_normalization.md                 # 1NF, 2NF, 3NF step-by-step breakdown
│   ├── 04_database_schema.md               # Detailed physical schema specifications
│   ├── 05_sample_data.sql                  # Realistic sample dataset SQL script
│   ├── 06_queries.sql                      # 12 core SQL queries with transactions
│   ├── 07_query_explanations.md            # Explanations of all queries with outputs
│   ├── 07_query_outputs/                   # Actual verified terminal output files
│   │   ├── query_01.txt ... query_12.txt
│   │   └── verify_counts.txt
│   ├── 08_backend_integration.md           # Express ↔ Prisma ↔ PostgreSQL integration
│   ├── 09_database_architecture.md         # End-to-end request lifecycle & architecture
│   ├── 09_data_integrity_performance.md    # Integrity rules, indexes, and scalability
│   └── 10_viva_questions.md                # 38 viva Q&As + 2-minute speech
├── prisma/
│   ├── migrations/                         # Version-controlled SQL migration scripts
│   │   └── 20261118115537_init/
│   │       └── migration.sql
│   └── schema.prisma                       # Declarative Prisma schema
├── public/                                 # Frontend Web Client
│   ├── index.html                          # Dashboard layout with 5 tabs
│   ├── style.css                           # Professional responsive stylesheet
│   └── app.js                              # Client controller using Fetch API
├── scripts/
│   ├── render_png.js                       # Generates PNG from SVG
│   └── run_queries.sh                      # Shell script executing all 12 queries
├── src/
│   └── server.js                           # Express server & Prisma REST API endpoints
├── tests/
│   └── test_api.js                         # Automated E2E integration test suite
├── .env                                    # Local database connection credentials
├── .env.example                            # Sample environment configuration template
├── .gitignore                              # Git exclusion rules
├── package.json                            # Node.js project metadata & npm scripts
└── README.md                               # Project documentation (this file)
```

---

## 🗄️ Database Structure

### Physical Relations:
1. **`students`**: `(student_id [PK], name, email [UQ], phone, department, created_at)`
2. **`courses`**: `(course_id [PK], course_name, course_code [UQ], credits [CHECK 1..6])`
3. **`enrollments`**: `(enrollment_id [PK], student_id [FK], course_id [FK], enrollment_date)` — `UNIQUE(student_id, course_id)`
4. **`attendance`**: `(attendance_id [PK], enrollment_id [FK], attendance_date, status [CHECK])` — `UNIQUE(enrollment_id, attendance_date)`

### Cardinalities:
- `students` ↔ `enrollments`: **1 : N**
- `courses` ↔ `enrollments`: **1 : N**
- `enrollments` ↔ `attendance`: **1 : N**
- `students` ↔ `courses`: **M : N** (resolved via `enrollments` junction table)

---

## 🚀 Quickstart Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher) and **npm**
- **PostgreSQL** (v14 or higher) running locally on port `5432`

---

### 2. Environment Configuration
Create a `.env` file in the project root:

```bash
# Format: postgresql://<USER>:<PASSWORD>@localhost:5432/student_management?schema=public
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/student_management?schema=public"
PORT=3000
```

---

### 3. Database Initialization & Migrations

If the database does not exist, create it:
```bash
createdb -h localhost -U <username> student_management
```

Apply Prisma database migrations to create all tables, foreign keys, CHECK constraints, and B-Tree indexes:
```bash
npx prisma migrate dev
```

Generate the Prisma Client library:
```bash
npx prisma generate
```

---

### 4. Insert Sample Data
Populate the database with realistic fictional records (10 students, 5 courses, 14 enrollments, 18 attendance records):
```bash
psql -h localhost -U <username> -d student_management -f DE/05_sample_data.sql
```

Verify inserted records:
```bash
psql -h localhost -U <username> -d student_management -c "SELECT 'students' AS tbl, count(*) FROM students UNION ALL SELECT 'courses', count(*) FROM courses UNION ALL SELECT 'enrollments', count(*) FROM enrollments UNION ALL SELECT 'attendance', count(*) FROM attendance;"
```

---

### 5. Start the Application
Start the Node.js Express server:
```bash
npm start
```

Open your web browser and navigate to:
```text
http://localhost:3000
```

---

## 🧪 Testing & Execution Evidence

### 1. Run Automated Backend Integration Tests
Execute the end-to-end test suite testing 28 distinct assertions across all APIs and constraints:
```bash
node tests/test_api.js
```
*(All 28 tests pass: CRUD operations, duplicate email rejection 409, credit constraint rejection 400, duplicate enrollment rejection 409, invalid status rejection 400).*

### 2. Run All 12 SQL Queries
Execute the 12 core SQL queries against PostgreSQL and save the terminal outputs:
```bash
bash scripts/run_queries.sh
```

Outputs are saved in [`DE/07_query_outputs/`](file:///Users/atharvajha/Desktop/Student-Management-DE/DE/07_query_outputs/) and documented in [`DE/07_query_explanations.md`](file:///Users/atharvajha/Desktop/Student-Management-DE/DE/07_query_explanations.md).

---

## 📡 REST API Reference

| Method | Endpoint | Description | Status Codes |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/dashboard/stats` | Retrieve live system-wide counters and recent enrollments | `200` |
| `GET` | `/api/students` | List all students (optional `?department=` & `?search=`) | `200` |
| `GET` | `/api/students/:id` | Get student profile with enrollments and attendance | `200`, `404` |
| `POST` | `/api/students` | Register a new student (validates unique email) | `201`, `400`, `409` |
| `PUT` | `/api/students/:id` | Update an existing student | `200`, `400`, `404`, `409` |
| `DELETE`| `/api/students/:id` | Purge student (cascades to enrollments & attendance) | `200`, `404` |
| `GET` | `/api/courses` | List all active courses | `200` |
| `POST` | `/api/courses` | Create new course (checks credits 1..6 & unique code) | `201`, `400`, `409` |
| `GET` | `/api/enrollments` | List all enrollments with student and course details | `200` |
| `POST` | `/api/enrollments` | Enroll student into a course (rejects duplicates) | `201`, `400`, `404`, `409` |
| `GET` | `/api/attendance` | List attendance log history (optional `?status=` filter) | `200` |
| `POST` | `/api/attendance` | Record daily attendance (rejects duplicate daily logs) | `201`, `400`, `404`, `409` |

---

## 🎓 College Viva Preparation

For a quick 2-minute speech and detailed answers to over 35 potential examiner questions (covering Normalization, ACID, Joins, PostgreSQL indexing, and ORM integration), open:
👉 [`DE/10_viva_questions.md`](file:///Users/atharvajha/Desktop/Student-Management-DE/DE/10_viva_questions.md)
