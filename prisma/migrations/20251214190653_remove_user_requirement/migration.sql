/*
  Warnings:

  - You are about to drop the column `student_id` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "instructors" DROP CONSTRAINT "instructors_user_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_user_id_fkey";

-- DropIndex
DROP INDEX "students_student_id_key";

-- AlterTable
ALTER TABLE "instructors" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "student_id",
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
