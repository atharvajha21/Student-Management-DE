-- CreateTable
CREATE TABLE "students" (
    "student_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(15),
    "department" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "course_id" SERIAL NOT NULL,
    "course_name" VARCHAR(100) NOT NULL,
    "course_code" VARCHAR(20) NOT NULL,
    "credits" INTEGER NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id"),
    CONSTRAINT "courses_credits_check" CHECK ("credits" >= 1 AND "credits" <= 6)
);

-- CreateTable
CREATE TABLE "enrollments" (
    "enrollment_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrollment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "attendance_id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" VARCHAR(10) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("attendance_id"),
    CONSTRAINT "attendance_status_check" CHECK ("status" IN ('Present', 'Absent'))
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "courses_course_code_key" ON "courses"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_course_id_key" ON "enrollments"("student_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_enrollment_id_attendance_date_key" ON "attendance"("enrollment_id", "attendance_date");

-- Performance Indexes on Foreign Keys and Filter columns
CREATE INDEX "idx_students_department" ON "students"("department");
CREATE INDEX "idx_enrollments_student_id" ON "enrollments"("student_id");
CREATE INDEX "idx_enrollments_course_id" ON "enrollments"("course_id");
CREATE INDEX "idx_attendance_enrollment_id" ON "attendance"("enrollment_id");

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE CASCADE;
