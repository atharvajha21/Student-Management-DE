# 01: Database Selection and Relational Justification

## 1. Project Background
The **Student Management System** is designed to manage academic institutions' core relational entities: students, course offerings, student course enrollments, and daily lecture attendance records.

Data integrity, strict relational consistency, schema enforcement, and ACID (Atomicity, Consistency, Isolation, Durability) guarantees are essential requirements for academic record-keeping.

---

## 2. Why a Relational Database (RDBMS) over NoSQL?

| Comparison Factor | Relational Database (RDBMS) | Document / NoSQL (e.g., MongoDB) | Why RDBMS is Chosen for this Project |
| :--- | :--- | :--- | :--- |
| **Data Structure** | Structured tabular format with well-defined schemas and foreign keys. | Semi-structured JSON-like BSON documents. | Academic records have fixed, predictable attributes (student IDs, course codes, credits). |
| **Data Relationships** | Native Many-to-Many associations via junction tables (`enrollments`). | Embedded documents or manual application-side references. | Students take many courses, and courses have many students. Embedding causes massive duplication. |
| **Data Integrity** | Enforced at the engine level (`PRIMARY KEY`, `FOREIGN KEY`, `CHECK`, `UNIQUE`). | Typically left to application-level logic. | Prevents invalid credits, non-existent students, or duplicate attendance at the database level. |
| **Redundancy** | Normalized to Third Normal Form (3NF), eliminating duplicate data. | Denormalized data model where course details are duplicated inside each student document. | Updating course details (e.g. credit count) updates exactly 1 record in RDBMS. In NoSQL, it risks update anomalies. |
| **ACID Compliance** | Full ACID transactions supported natively. | Eventual consistency or complex multi-document transaction overhead. | Enrolling a student and logging attendance requires immediate, consistent state. |

---

## 3. Why PostgreSQL Specifically?

Among modern relational database management systems (such as MySQL, SQLite, and Oracle), **PostgreSQL** was selected as the optimal database for this Data Engineering project for the following key reasons:

### 1. Robust Constraint Enforcement
PostgreSQL provides comprehensive native constraint support:
- `CHECK` constraints (e.g., `CHECK (credits >= 1 AND credits <= 6)` and `CHECK (status IN ('Present', 'Absent'))`).
- `UNIQUE` constraints across multiple columns (`UNIQUE (student_id, course_id)` and `UNIQUE (enrollment_id, attendance_date)`).
- Standard cascading actions (`ON DELETE CASCADE`, `ON UPDATE CASCADE`).

### 2. Standard SQL Compliance & Advanced Querying
PostgreSQL adheres closely to ANSI-SQL standards. It supports advanced analytical queries, subqueries, complex multi-table joins, window functions, and rich aggregate functions that are central to Data Engineering curriculum requirements.

### 3. Native Concurrency via Multi-Version Concurrency Control (MVCC)
PostgreSQL handles concurrent student registrations and attendance logging through MVCC. Readers do not block writers, and writers do not block readers, providing high transaction throughput without locking tables.

### 4. Enterprise-Grade Indexing Capabilities
Beyond standard B-Tree indexes, PostgreSQL supports specialized indexing strategies (Hash, GIN, GiST, BRIN, Partial Indexes). In our system, B-Tree indexes on foreign keys (`student_id`, `course_id`, `enrollment_id`) and search columns (`department`) accelerate query execution significantly.

### 5. Seamless Modern ORM Integration
PostgreSQL provides first-class support for modern Node.js Object-Relational Mapping (ORM) tools, notably **Prisma ORM**. Prisma generates fully type-safe queries, migration histories, and introspection directly from PostgreSQL catalogs.

---

## 4. Conclusion
PostgreSQL provides the ideal combination of strict referential integrity, performance, standards compliance, and developer ergonomics, making it the most suitable database for building an enterprise-grade academic data platform.
