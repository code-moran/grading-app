# Import Lessons Script Guide

## Overview

The `import-lessons.ts` script imports all lessons from `lib/lessons.ts` into the database and assigns them to a course. This script handles:

- Creating lessons with course assignment
- Creating exercises for each lesson
- Creating rubrics with criteria and levels
- Linking all components together

## Prerequisites

1. **Database Schema Updated**: Make sure you've run:
   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Course Exists or Will Be Created**: The script will create a default course "Web Design Fundamentals" if none exists.

## Usage

### Basic Usage (Default Course)

Import lessons to the default "Web Design Fundamentals" course:

```bash
npm run import-lessons
```

Or directly:

```bash
tsx scripts/import-lessons.ts
```

### Specify Course

Import lessons to a specific course by title or ID:

```bash
# By course title
tsx scripts/import-lessons.ts "Advanced Web Development"

# By course ID
tsx scripts/import-lessons.ts "clx1234567890abcdef"
```

## What the Script Does

1. **Course Management**:
   - Finds existing course by title/ID, or creates "Web Design Fundamentals"
   - Uses the course for all lesson assignments

2. **Lesson Import**:
   - Checks if lesson with same number already exists
   - Creates new lessons or updates existing ones
   - Assigns all lessons to the specified course

3. **Exercise Creation**:
   - Creates exercises for each lesson
   - Links exercises to their lessons

4. **Rubric Management**:
   - Creates rubrics for each exercise
   - Creates or reuses rubric levels (Excellent, Good, Satisfactory, Needs Improvement)
   - Creates or reuses rubric criteria
   - Links criteria and levels to rubrics via mappings

5. **Quiz Question Import**:
   - Imports quiz questions for each lesson from `lib/quiz-questions.ts`
   - Maps questions to lessons by lesson number
   - Skips duplicate questions (by question text)
   - Maintains question order

## Output

The script provides detailed output:

```
🚀 Starting lesson import...

✅ Using existing course: Web Design Fundamentals (ID: clx...)

✅ Created lesson 1: Introduction to HTML
   └─ Created 1 exercise(s)
✅ Created lesson 2: Basic HTML Elements
   └─ Created 1 exercise(s)
...

📊 Import Summary:
   ✅ Created: 30 lessons
   📝 Updated: 0 lessons
   ⏭️  Skipped: 0 lessons
   📚 Total exercises: 30
   ❓ Quiz questions created: 60
   ⏭️  Quiz questions skipped: 0

🎉 Lesson import completed successfully!

💡 Next steps:
   1. Assign instructors to the course in /admin/courses
   2. Instructors can now manage lessons in /instructor/courses
```

## Behavior

### Existing Lessons

- If a lesson with the same number exists:
  - **Same course**: Skipped (not updated)
  - **Different course**: Updated to assign to the new course
  - **No course**: Updated to assign to the specified course

### Rubric Levels and Criteria

- Common rubric levels are reused across all lessons
- Criteria are reused if they have the same name and weight
- This prevents duplicate data in the database

### Quiz Questions

- Quiz questions are imported from `lib/quiz-questions.ts`
- Questions are mapped to lessons by lesson number
- Duplicate questions (by question text) are skipped
- Question order is preserved

## Troubleshooting

### Error: "Course ID is required"
- Make sure the course exists or the script can create it
- Check database connection

### Error: "Lesson number already exists"
- The script handles this by updating existing lessons
- If you want to replace, delete existing lessons first

### Error: Prisma Client not generated
- Run `npm run db:generate` first
- Make sure dev server is stopped

## Notes

- **Idempotent**: Safe to run multiple times
- **Non-destructive**: Won't delete existing data
- **Updates**: Updates lessons if they're assigned to different courses
- **Exercises**: Creates exercises even if lesson already exists (if missing)

## After Import

1. **Assign Instructors**: Go to `/admin/courses` and assign instructors to the course
2. **Verify**: Check `/instructor/courses` to see imported lessons
3. **Manage**: Instructors can now manage lessons in their assigned courses

