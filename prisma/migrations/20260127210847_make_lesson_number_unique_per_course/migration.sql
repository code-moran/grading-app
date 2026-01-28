-- AlterTable
-- Drop the existing unique constraint on number (if it exists)
ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_number_key";

-- CreateIndex
-- Create a composite unique constraint on number and course_id
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_number_course_id_key" ON "lessons"("number", "course_id");
