# Instructor Course Management Guide

## Overview

The instructor course management module allows instructors to manage courses assigned to them by administrators. All lessons must now be assigned to a course.

## Database Schema Changes

### New Model: CourseInstructor
- Links instructors to courses they manage
- Tracks assignment date and admin who assigned
- Unique constraint on (courseId, instructorId)

### Updated Model: Lesson
- `courseId` is now **required** (changed from optional)
- Lessons must be assigned to a course when created
- Cannot have unassigned lessons

### Updated Model: Instructor
- Added relation to `CourseInstructor` for course assignments

### Updated Model: Course
- Added relation to `CourseInstructor` for instructor assignments

## Setup Instructions

### 1. Update Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push
```

**Important:** If you have existing lessons without a `courseId`, you'll need to:
1. Create a default course (if you haven't already)
2. Assign all existing lessons to a course before running the migration

### 2. Assign Instructors to Courses

1. Navigate to `/admin/courses`
2. Click "Manage" on a course
3. In the "Assigned Instructors" section, click "Assign Instructor"
4. Select an approved instructor and click "Assign"

## Features

### For Instructors

#### Course List (`/instructor/courses`)
- View all courses assigned to you
- Search courses by title or description
- See course statistics (lessons, subscribers)
- Quick access to course management

#### Course Detail (`/instructor/courses/[id]`)
- View course information and statistics
- Manage lessons:
  - View all assigned lessons
  - Add lessons from other courses (reassign)
  - Bulk assign multiple lessons
- View subscribers
- See course analytics

**Note:** Instructors can only manage courses they are assigned to.

### For Administrators

#### Course Management (`/admin/courses/[id]`)
- Assign instructors to courses
- Unassign instructors from courses
- View all assigned instructors for a course
- Manage lessons (same as before)

## API Endpoints

### Instructor Endpoints

- `GET /api/instructor/courses` - Get courses assigned to instructor
- `GET /api/instructor/courses/[id]` - Get course details (if assigned)
- `POST /api/instructor/courses/[id]/lessons` - Assign lesson to course
- `DELETE /api/instructor/courses/[id]/lessons` - Unassign lesson (returns error - lessons must stay assigned)

### Admin Endpoints

- `GET /api/courses/[id]/instructors` - Get instructors assigned to course
- `POST /api/courses/[id]/instructors` - Assign instructor to course
- `DELETE /api/courses/[id]/instructors` - Unassign instructor from course
- `GET /api/instructors` - Get all approved instructors

### Updated Endpoints

- `POST /api/lessons` - Now requires `courseId` parameter
- `GET /api/lessons/unassigned` - Now returns lessons from other courses (excludes specified course)

## Workflow

### Assigning Instructors to Courses (Admin)

1. Navigate to `/admin/courses`
2. Click "Manage" on a course
3. Scroll to "Assigned Instructors" section
4. Click "Assign Instructor"
5. Select an approved instructor
6. Click "Assign"

### Managing Course Lessons (Instructor)

1. Navigate to `/instructor/courses`
2. Click on a course card
3. Click "Add Lessons" button
4. Select lessons from other courses (or create new ones with courseId)
5. Click "Assign Selected" or assign individually

### Creating Lessons

**Important:** All new lessons must include a `courseId`:

```javascript
POST /api/lessons
{
  "number": 1,
  "title": "Lesson Title",
  "description": "Description",
  "duration": "1 hour",
  "courseId": "course-id-here" // REQUIRED
}
```

## Permissions

- **Instructors**: Can only view and manage courses they are assigned to
- **Admins**: Can assign/unassign instructors, manage all courses
- **Students**: No change - can still subscribe to courses

## Important Notes

1. **Lessons Must Have a Course**: All lessons must be assigned to a course. You cannot create unassigned lessons.

2. **Lesson Reassignment**: Instructors can reassign lessons from other courses to their assigned courses. This moves the lesson from one course to another.

3. **Instructor Assignment**: Only approved instructors can be assigned to courses. Admins must approve instructor accounts first.

4. **Course Access**: Instructors can only see and manage courses they are assigned to. They cannot access other courses.

5. **Navigation**: The instructor dashboard now includes a "Courses" link in the navigation menu.

## Migration Notes

If you have existing data:

1. **Existing Lessons**: All lessons must have a `courseId`. Before running the migration:
   - Create a default course if needed
   - Assign all existing lessons to a course
   - Or delete lessons without courses

2. **Instructor Assignments**: Existing courses won't have instructors assigned. Admins need to manually assign instructors after migration.

3. **Data Integrity**: The schema enforces that:
   - Every lesson belongs to exactly one course
   - Instructors can be assigned to multiple courses
   - Courses can have multiple instructors

## Troubleshooting

### Error: "Course ID is required"
- Make sure you're providing `courseId` when creating lessons
- Check that the course exists

### Error: "You are not assigned to this course"
- Instructors can only manage courses assigned to them
- Contact an admin to get assigned to the course

### Error: "Instructor must be approved before assignment"
- Only approved instructors can be assigned to courses
- Approve the instructor account first in `/admin/instructors`

### No courses showing for instructor
- Check that the instructor is assigned to courses
- Verify the instructor account is approved
- Admins need to assign instructors to courses

