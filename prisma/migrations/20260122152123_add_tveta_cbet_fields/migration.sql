/*
  Warnings:

  - You are about to drop the `grading_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "grading_sessions" DROP CONSTRAINT "grading_sessions_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "grading_sessions" DROP CONSTRAINT "grading_sessions_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "grading_sessions" DROP CONSTRAINT "grading_sessions_student_id_fkey";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "knqf_level" INTEGER,
ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "qualification_code" TEXT,
ADD COLUMN     "unit_standard_id" TEXT;

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "competency_unit_id" TEXT;

-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "assessor_id" TEXT,
ADD COLUMN     "competency_status" TEXT,
ADD COLUMN     "is_competent" BOOLEAN,
ADD COLUMN     "moderated_at" TIMESTAMP(3),
ADD COLUMN     "moderated_by" TEXT,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" TEXT;

-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "accreditation_expiry" TIMESTAMP(3),
ADD COLUMN     "accreditation_number" TEXT,
ADD COLUMN     "is_assessor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_moderator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verifier" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "grading_sessions";

-- CreateTable
CREATE TABLE "unit_standards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "knqf_level" INTEGER NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_units" (
    "id" TEXT NOT NULL,
    "unit_standard_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "performance_criteria" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessor_accreditations" (
    "id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "accreditation_type" TEXT NOT NULL,
    "accreditation_number" TEXT NOT NULL,
    "issuing_authority" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessor_accreditations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_audit_logs" (
    "id" TEXT NOT NULL,
    "grade_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_by_role" TEXT NOT NULL,
    "previous_value" JSONB,
    "new_value" JSONB,
    "notes" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_standards_code_key" ON "unit_standards"("code");

-- CreateIndex
CREATE UNIQUE INDEX "competency_units_unit_standard_id_code_key" ON "competency_units"("unit_standard_id", "code");

-- CreateIndex
CREATE INDEX "assessment_audit_logs_grade_id_idx" ON "assessment_audit_logs"("grade_id");

-- CreateIndex
CREATE INDEX "assessment_audit_logs_performed_by_idx" ON "assessment_audit_logs"("performed_by");

-- CreateIndex
CREATE INDEX "assessment_audit_logs_created_at_idx" ON "assessment_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_competency_unit_id_fkey" FOREIGN KEY ("competency_unit_id") REFERENCES "competency_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_unit_standard_id_fkey" FOREIGN KEY ("unit_standard_id") REFERENCES "unit_standards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_units" ADD CONSTRAINT "competency_units_unit_standard_id_fkey" FOREIGN KEY ("unit_standard_id") REFERENCES "unit_standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessor_accreditations" ADD CONSTRAINT "assessor_accreditations_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_audit_logs" ADD CONSTRAINT "assessment_audit_logs_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
