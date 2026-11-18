# Database Normalization: From Unnormalized Data to 3NF

## 1. What is Normalization?

**Normalization** is a systematic database design technique used in relational database management systems (RDBMS) to organize tables in a way that:
1. **Eliminates data redundancy** (prevents storing the exact same fact in multiple places).
2. **Prevents data anomalies**:
   - **Insertion Anomaly**: Inability to record a student without immediately forcing them into a course, or vice versa.
   - **Update Anomaly**: Changing a student's phone number or a course's credit count requires updating 50 different rows. If one row is missed, data becomes inconsistent.
   - **Deletion Anomaly**: If the last student enrolled in a course is deleted, the course information itself is accidentally erased from existence.

---

## 2. Unnormalized Form (UNF) Example

Imagine a college that stores student registrations, course details, and attendance tracking in a single flat spreadsheet:

| StudentID | Name | Email | Dept | Courses (Code, Name, Credits) | AttendanceRecords (Date, Status) |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | Aarav Sharma | aarav.sharma@example.edu | Computer Science | CS301 (DB Eng, 4), CS201 (DSA, 4) | (2026-11-03, Present), (2026-11-04, Present) |
| **2** | Diya Patel | diya.patel@example.edu | Information Technology | CS301 (DB Eng, 4), IT302 (Web Dev, 3) | (2026-11-03, Present), (2026-11-04, Absent) |
| **10** | Tanvi Kulkarni | tanvi.kulkarni@example.edu | Civil | *None* | *None* |

### Why is this Unnormalized?
- **Repeating groups**: Columns contain multi-valued lists (multiple courses and multiple attendance dates packed inside single cells).
- Non-atomic attributes violate the core definition of a relational attribute.

---

## 3. First Normal Form (1NF)

### Rule for 1NF
> A relation is in **First Normal Form (1NF)** if and only if:
> 1. Every attribute contains only **atomic** (single, indivisible) values.
> 2. There are **no repeating groups** or multi-valued arrays.
> 3. Each row is unique, identified by a Primary Key (or Composite Primary Key).

### Step 1 Transformation: Flattening into Atomic Rows
We flatten the multi-valued attributes into individual rows:

| StudentID | Name | Email | Dept | CourseCode | CourseName | Credits | AttendDate | AttendStatus |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **1** | Aarav Sharma | aarav.sharma@example.edu | Computer Science | CS301 | DB Eng | 4 | 2026-11-03 | Present |
| **1** | Aarav Sharma | aarav.sharma@example.edu | Computer Science | CS301 | DB Eng | 4 | 2026-11-04 | Present |
| **1** | Aarav Sharma | aarav.sharma@example.edu | Computer Science | CS201 | DSA | 4 | 2026-11-03 | Present |
| **2** | Diya Patel | diya.patel@example.edu | Info Tech | CS301 | DB Eng | 4 | 2026-11-03 | Present |
| **2** | Diya Patel | diya.patel@example.edu | Info Tech | CS301 | DB Eng | 4 | 2026-11-04 | Absent |

### Problems in 1NF:
1. **Composite Primary Key**: To uniquely identify each row in 1NF, the primary key must be composite: `{StudentID, CourseCode, AttendDate}`.
2. **Partial Dependencies exist**: Non-key attributes depend on only *part* of the composite primary key.

---

## 4. Second Normal Form (2NF)

### Rule for 2NF
> A relation is in **Second Normal Form (2NF)** if and only if:
> 1. It is already in **1NF**.
> 2. There are **NO partial dependencies** — every non-key attribute must be **fully functionally dependent** on the **entire** Primary Key.
>
> *(Note: A table whose primary key consists of a single column is automatically in 2NF once it is in 1NF).*

### Identifying Partial Dependencies in the 1NF Table
The Composite Key is: `{StudentID, CourseCode, AttendDate}`.

- `{StudentID} → Name, Email, Dept`
  - Dependent **only** on `StudentID`, NOT on `CourseCode` or `AttendDate`. This is a **partial dependency**.
- `{CourseCode} → CourseName, Credits`
  - Dependent **only** on `CourseCode`, NOT on `StudentID` or `AttendDate`. This is another **partial dependency**.
- `{StudentID, CourseCode, AttendDate} → AttendStatus`
  - Dependent on the full combination.

### Step 2 Transformation: Decomposing into 2NF Tables
We split the relation into entities where non-key columns depend only on the respective primary keys:

#### Table A: `Students` (Candidate Key: `StudentID`)
- Functional Dependencies: `StudentID → Name, Email, Phone, Department`
- Fully functionally dependent on `StudentID`. (In 2NF)

#### Table B: `Courses` (Candidate Key: `CourseID` or `CourseCode`)
- Functional Dependencies: `CourseID → CourseName, CourseCode, Credits`
- Fully functionally dependent on `CourseID`. (In 2NF)

#### Table C: `Enrollments` (Composite Key: `{StudentID, CourseID}`)
- Represents the Many-to-Many association.
- Attributes: `EnrollmentID (PK)`, `StudentID (FK)`, `CourseID (FK)`, `EnrollmentDate`.

#### Table D: `Attendance` (Composite Unique: `{EnrollmentID, AttendDate}`)
- Attributes: `AttendanceID (PK)`, `EnrollmentID (FK)`, `AttendDate`, `Status`.
- Dependent on `{EnrollmentID, AttendDate}`.

---

## 5. Third Normal Form (3NF)

### Rule for 3NF
> A relation is in **Third Normal Form (3NF)** if and only if:
> 1. It is already in **2NF**.
> 2. There are **NO transitive dependencies** (no non-key attribute depends on another non-key attribute).
>
> In formal terms: For every functional dependency $X \to Y$, either:
> - $X$ is a **superkey**, OR
> - $Y$ is a **prime attribute** (part of a candidate key).

### What is a Transitive Dependency?
A transitive dependency occurs when attribute $A$ determines $B$, and $B$ determines $C$ ($A \to B \to C$). Therefore, $A$ indirectly determines $C$ through a non-key attribute.

*Example of a transitive dependency in a bad design*:
Suppose our `Students` table was:
`{StudentID (PK), Name, DepartmentName, DepartmentHOD, HODOfficeRoom}`
- Here: `StudentID → DepartmentName`, and `DepartmentName → DepartmentHOD`.
- Because `DepartmentName` is NOT a superkey, `StudentID → DepartmentHOD` is a transitive dependency!
- If the HOD changes, every student row in that department must be updated.

### Resolving Transitive Dependencies for 3NF:
In our student management system:
- In `Students`: Every non-key column (`name`, `email`, `phone`, `department`, `created_at`) depends directly and exclusively on the primary key `student_id`. There are no hidden intermediate determinants.
- In `Courses`: `course_name` and `credits` depend directly on `course_id`. (`course_code` is an alternate unique candidate key).
- In `Enrollments`: `enrollment_date` depends directly on `enrollment_id`. Foreign keys `student_id` and `course_id` simply reference their parent primary keys.
- In `Attendance`: `attendance_date` and `status` depend directly on `attendance_id`.

Therefore, all tables are strictly in **Third Normal Form (3NF)**.

---

## 6. Final Normalized Schema Summary

```
+---------------------------------------------------------------------------------+
|                                STUDENTS (3NF)                                   |
+---------------------------------------------------------------------------------+
| PK: student_id | name | email (UQ) | phone | department | created_at            |
+---------------------------------------------------------------------------------+
        | 1
        |
        | N
+---------------------------------------------------------------------------------+
|                               ENROLLMENTS (3NF)                                 |
+---------------------------------------------------------------------------------+
| PK: enrollment_id | FK: student_id | FK: course_id | enrollment_date            |
| UQ: (student_id, course_id)                                                     |
+---------------------------------------------------------------------------------+
        | N
        |
        | 1
+---------------------------------------------------------------------------------+
|                                 COURSES (3NF)                                   |
+---------------------------------------------------------------------------------+
| PK: course_id | course_name | course_code (UQ) | credits (CHECK 1..6)           |
+---------------------------------------------------------------------------------+
        |
        | (from ENROLLMENTS)
        | 1
        |
        | N
+---------------------------------------------------------------------------------+
|                                ATTENDANCE (3NF)                                 |
+---------------------------------------------------------------------------------+
| PK: attendance_id | FK: enrollment_id | attendance_date | status (CHECK Pres/Abs)|
| UQ: (enrollment_id, attendance_date)                                            |
+---------------------------------------------------------------------------------+
```

### Key Advantages of this 3NF Schema:
1. **Zero Redundancy**: Course details (`course_name`, `credits`) are stored exactly once in `courses`.
2. **Safe Insertions**: New courses or students can be registered without requiring immediate enrollments or attendance.
3. **Safe Updates**: Changing an email or course credit requires changing exactly 1 row.
4. **Referential Integrity**: Cascading deletes eliminate orphan records when students or courses leave the institution.
