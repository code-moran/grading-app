/*
  Warnings:

  - A unique constraint covering the columns `[student_id,course_id]` on the table `course_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "course_subscriptions" ADD COLUMN     "student_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "course_subscriptions_student_id_course_id_idx" ON "course_subscriptions"("student_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_subscriptions_student_id_course_id_key" ON "course_subscriptions"("student_id", "course_id");

-- AddForeignKey
ALTER TABLE "course_subscriptions" ADD CONSTRAINT "course_subscriptions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
