-- AlterTable
ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "lessons_number_course_id_key" ON "lessons"("number", "course_id");
