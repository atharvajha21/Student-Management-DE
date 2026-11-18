# 10: Viva Preparation Guide & 35+ Questions and Answers

---

## 🎙️ 2-Minute College Viva Speech (Memorize This!)

> *"Good morning, Professors.*
>
> *For my Data Engineering project, I have developed the **Student Management System** using **PostgreSQL 17**, **Node.js with Express.js**, and **Prisma ORM**.*
>
> *The primary objective of this project is to build an academic platform that guarantees strict data integrity, referential consistency, and optimal querying performance.*
>
> *Our database architecture comprises four interconnected tables: **students**, **courses**, **enrollments**, and **attendance**.*
>
> *To eliminate data redundancy and prevent insertion, update, and deletion anomalies, I normalized the database schema to **Third Normal Form (3NF)**. The Many-to-Many relationship between students and courses is cleanly resolved via an associative junction table called **enrollments**.*
>
> *We have enforced robust database constraints, including **PRIMARY KEYs**, **FOREIGN KEYs** with `ON DELETE CASCADE` to prevent orphan records, **UNIQUE** constraints on student emails, course codes, and duplicate enrollments, as well as **CHECK** constraints that enforce course credits between 1 and 6 and attendance status strictly to 'Present' or 'Absent'.*
>
> *To optimize query execution, we designed B-Tree indexes on frequently filtered columns like department and foreign keys. On top of PostgreSQL, I built RESTful APIs using Express.js and Prisma ORM, coupled with a responsive, modern HTML5 and Vanilla JavaScript frontend that connects live to the database using the Fetch API.*
>
> *I have also executed and documented 12 comprehensive SQL queries demonstrating aggregations, joins, group filtering, and subqueries with verified terminal outputs.*
>
> *I am ready for your questions. Thank you."*

---

## 📚 38 Comprehensive Viva Questions & Beginner-Friendly Answers

### Section A: DBMS & RDBMS Fundamentals

#### Q1: What is the difference between DBMS and RDBMS?
**Answer:** A DBMS (Database Management System) stores data as flat files or hierarchical trees with little or no relationship enforcement. An RDBMS (Relational Database Management System) organizes data into two-dimensional tables (relations) consisting of rows and columns, enforcing relationships via primary and foreign keys and guaranteeing ACID properties.

#### Q2: What are the ACID properties in database engineering?
**Answer:**
- **Atomicity:** All operations in a transaction succeed together, or all fail together (all-or-nothing).
- **Consistency:** The database transitions from one valid state to another, preserving all schema constraints.
- **Isolation:** Concurrent transactions execute without interfering with one another.
- **Durability:** Once committed, changes are permanently written to non-volatile storage even during a crash.

#### Q3: Why did you choose PostgreSQL over MySQL or MongoDB?
**Answer:** PostgreSQL is an enterprise-grade, highly standards-compliant open-source RDBMS. Unlike MongoDB (NoSQL), PostgreSQL enforces strict relational integrity, composite unique keys, and domain check constraints natively. Compared to MySQL, PostgreSQL offers superior support for complex analytical queries, concurrency via MVCC, and modern ORM integration.

---

### Section B: Keys & Constraints

#### Q4: What is a Primary Key?
**Answer:** A Primary Key is an attribute or combination of attributes that uniquely identifies each record in a table. It cannot accept `NULL` values, and every table should have exactly one primary key. In our project, `student_id`, `course_id`, `enrollment_id`, and `attendance_id` are primary keys.

#### Q5: What is a Foreign Key?
**Answer:** A Foreign Key is a field in a child table that points to the Primary Key of a parent table. It enforces referential integrity by ensuring that child records cannot reference non-existent parent rows.

#### Q6: What does `ON DELETE CASCADE` mean?
**Answer:** It is a referential action. When a parent row is deleted, PostgreSQL automatically deletes all dependent child records in related tables. For example, deleting a student automatically deletes their corresponding enrollments and attendance records, preventing orphan data.

#### Q7: What is the difference between `PRIMARY KEY` and `UNIQUE` constraint?
**Answer:**
- A table can have only **one** Primary Key, but **multiple** Unique constraints.
- A Primary Key never allows `NULL` values. A Unique constraint allows `NULL` (unless explicitly defined as `NOT NULL`).

#### Q8: What is a `CHECK` constraint? Give an example from your project.
**Answer:** A CHECK constraint limits the range or values that can be inserted into a column. In our `courses` table, we use `CHECK (credits >= 1 AND credits <= 6)`. In `attendance`, we use `CHECK (status IN ('Present', 'Absent'))`.

---

### Section C: Normalization

#### Q9: What is Normalization and why is it needed?
**Answer:** Normalization is the process of structuring relational tables to minimize data redundancy and prevent insertion, update, and deletion anomalies.

#### Q10: What is First Normal Form (1NF)?
**Answer:** A table is in 1NF if every column contains atomic (single, indivisible) values, there are no repeating groups or arrays, and each row is uniquely identifiable.

#### Q11: What is a Partial Dependency, and how is it related to 2NF?
**Answer:** A partial dependency occurs when a non-key column depends on only *part* of a composite primary key. Second Normal Form (2NF) requires a table to be in 1NF and have **no partial dependencies**.

#### Q12: What is a Transitive Dependency, and how is it related to 3NF?
**Answer:** A transitive dependency occurs when a non-key column depends on another non-key column ($A \to B \to C$). Third Normal Form (3NF) requires a table to be in 2NF and have **no transitive dependencies**.

#### Q13: Is your database normalized to 3NF?
**Answer:** Yes. Every non-key attribute in `students`, `courses`, `enrollments`, and `attendance` depends directly and solely on its primary key. There are no repeating groups, no partial dependencies, and no transitive dependencies.

---

### Section D: Relational Modeling & Cardinality

#### Q14: How do you represent a Many-to-Many relationship in a relational database?
**Answer:** A Many-to-Many relationship cannot be directly linked with a single foreign key. It is resolved by creating an **associative junction table** containing foreign keys referencing both parent tables. In our project, `enrollments` connects `students` and `courses`.

#### Q15: What are the cardinalities present in your database?
**Answer:**
- Students to Enrollments: One-to-Many (1:N).
- Courses to Enrollments: One-to-Many (1:N).
- Enrollments to Attendance: One-to-Many (1:N).
- Students to Courses: Many-to-Many (M:N) through Enrollments.

---

### Section E: SQL Queries, Joins & Aggregations

#### Q16: What is the difference between `INNER JOIN` and `LEFT JOIN`?
**Answer:**
- `INNER JOIN`: Returns only rows where there is a matching value in both tables.
- `LEFT JOIN`: Returns all rows from the left table, plus matched rows from the right table. If no match exists, `NULL` values are returned for right-table columns.

#### Q17: Give an example from your project where a `LEFT JOIN` is necessary.
**Answer:** In Query 11, when listing all students and their enrolled courses, a `LEFT JOIN` ensures that students with zero enrollments (like student Tanvi Kulkarni) are still displayed with 'No Course Enrolled' instead of being excluded.

#### Q18: What is the difference between `WHERE` and `HAVING`?
**Answer:**
- `WHERE` filters individual rows **before** any grouping or aggregation takes place.
- `HAVING` filters aggregated groups **after** the `GROUP BY` clause has been computed.

#### Q19: Can you use an aggregate function like `COUNT()` in a `WHERE` clause?
**Answer:** No. Aggregate functions compute results across sets of rows, which are not evaluated until `GROUP BY` is processed. To filter by aggregate results, you must use `HAVING`.

#### Q20: What does the `RETURNING` clause do in PostgreSQL?
**Answer:** The `RETURNING` clause returns values from newly inserted, updated, or deleted rows immediately in the query result, eliminating the need for an extra `SELECT` statement.

#### Q21: What is a Subquery? Where did you use it?
**Answer:** A subquery is a query nested inside another SQL statement. In Query 12, we used a subquery inside a `HAVING` clause to find students taking more courses than the system-wide average enrollment count.

---

### Section F: Performance & Indexing

#### Q22: What is a Database Index?
**Answer:** An index is an auxiliary data structure (typically a balanced B-Tree) that allows the database engine to find specific rows in $O(\log n)$ time without scanning every row sequentially.

#### Q23: What are the drawbacks of having too many indexes?
**Answer:** While indexes speed up read (`SELECT`) queries, they slow down write operations (`INSERT`, `UPDATE`, `DELETE`) because every index must be updated on each write. They also consume extra disk storage.

#### Q24: What indexes did you create in this project?
**Answer:**
1. Primary key B-Tree indexes on each table.
2. Unique B-Tree indexes on `email`, `course_code`, `(student_id, course_id)`, and `(enrollment_id, attendance_date)`.
3. Performance indexes on `department`, `student_id`, `course_id`, and `enrollment_id`.

---

### Section G: Node.js, Express & Prisma ORM

#### Q25: What is an ORM (Object-Relational Mapper)?
**Answer:** An ORM is a software library that bridges object-oriented programming languages and relational databases. It allows developers to query and manipulate database records using programming objects instead of raw SQL strings.

#### Q26: Why use Prisma ORM instead of writing raw SQL in Node.js?
**Answer:**
1. **Type Safety:** Catches schema errors at compile time.
2. **SQL Injection Protection:** Queries use parameterized values automatically.
3. **Migration Management:** Generates and tracks database migrations systematically.
4. **Clean Syntax:** Simplifies complex multi-table joins using clean `include` syntax.

#### Q27: How does Prisma connect to PostgreSQL?
**Answer:** Prisma reads the `DATABASE_URL` environment variable from the `.env` file and establishes a connection pool to PostgreSQL on localhost port 5432 using native binary database protocol.

#### Q28: What is a Prisma migration?
**Answer:** A migration is a version-controlled SQL script generated by Prisma that applies incremental schema modifications (creating tables, constraints, and indexes) to the PostgreSQL database.

#### Q29: What is Express.js and what role does it play?
**Answer:** Express.js is a minimalist web framework for Node.js. It acts as our application backend, providing RESTful API endpoints, parsing JSON bodies, performing request validation, and returning standardized HTTP status codes.

#### Q30: What HTTP status codes does your API use?
**Answer:**
- `200 OK`: Successful read, update, or delete.
- `201 Created`: Successful creation of student, course, enrollment, or attendance.
- `400 Bad Request`: Validation failure (e.g. missing fields, credits not between 1 and 6).
- `404 Not Found`: Referenced entity does not exist.
- `409 Conflict`: Unique constraint violation (e.g. duplicate email, duplicate enrollment).
- `500 Internal Server Error`: Server exception.

---

### Section H: Full-Stack Integration & Architecture

#### Q31: How does the frontend communicate with the backend?
**Answer:** The frontend uses the standard browser **Fetch API** to send asynchronous HTTP requests (GET, POST, PUT, DELETE) with JSON payloads to Express REST endpoints.

#### Q32: What happens if a user tries to enroll a student twice in the same course?
**Answer:**
1. Express or PostgreSQL catches the composite unique constraint `UNIQUE (student_id, course_id)`.
2. The server responds with HTTP `409 Conflict` and an explanatory message.
3. The frontend displays an alert toast informing the user that the student is already enrolled.

#### Q33: Why did you use CommonJS instead of ES Modules?
**Answer:** CommonJS (`require` and `module.exports`) is the established, highly compatible standard in Node.js, making the code simple, predictable, and beginner-friendly for college lab evaluation.

#### Q34: What is the purpose of the `.env` file?
**Answer:** It stores sensitive environment configuration (such as database credentials and port numbers) outside the application codebase. It is listed in `.gitignore` to prevent leaking credentials to version control.

#### Q35: What is Write-Ahead Logging (WAL) in PostgreSQL?
**Answer:** WAL is a standard reliability technique where changes are first recorded in a sequential log on disk before being applied to the actual database data pages. This ensures complete recovery and durability in case of power outages or server crashes.

#### Q36: How would you scale this database if the university had 100,000 students?
**Answer:**
1. Implement connection pooling (such as PgBouncer).
2. Range-partition the large `attendance` table by semester or year.
3. Add read replicas to distribute query traffic away from the primary write node.
4. Cache frequently accessed read data (like course catalogs) using Redis.

#### Q37: How do you prevent SQL injection in this application?
**Answer:** By using Prisma ORM. Prisma automatically parameterizes every variable so input values are treated as data values rather than executable SQL syntax.

#### Q38: What would happen if you deleted a course that had 50 student enrollments?
**Answer:** Because we configured `ON DELETE CASCADE` on `enrollments.course_id`, PostgreSQL will automatically delete all 50 enrollment records, and subsequently cascade-delete all attendance records linked to those enrollments, preserving referential consistency.
