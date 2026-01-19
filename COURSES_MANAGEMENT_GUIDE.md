# Courses Management Module Guide

## Overview

The Courses Management Module provides comprehensive functionality for administrators to create, manage, and monitor courses in the platform.

## Features

### 1. Course List View (`/admin/courses`)

**Features:**
- View all courses in a grid layout
- Search courses by title or description
- Filter courses by status (All, Active, Inactive)
- Create new courses
- Quick actions: Manage, Activate/Deactivate
- Course statistics display (lessons, subscribers)

**Actions:**
- **Create Course**: Click "Create Course" button to add a new course
- **Manage Course**: Click "Manage" to view course details
- **Toggle Status**: Activate or deactivate courses
- **Search**: Use search bar to find specific courses
- **Filter**: Use dropdown to filter by active/inactive status

### 2. Course Detail View (`/admin/courses/[id]`)

**Features:**
- Complete course information
- Course statistics and analytics
- Lesson management
- Subscriber management
- Edit course details
- Delete course

**Sections:**

#### Course Header
- Course title and description
- Active/Inactive status badge
- Quick stats (lessons, subscribers, creation date)
- Edit and Delete buttons

#### Analytics Dashboard
- **Gradient Stat Cards:**
  - Total Lessons
  - Active Subscribers
  - Total Exercises
  - Completion Rate
- **Additional Metrics:**
  - Total Submissions
  - Quiz Attempts
  - Average Engagement (submissions per student)

#### Lesson Management
- View all assigned lessons
- Add lessons from unassigned pool
- Bulk assign multiple lessons
- Remove lessons from course
- Lesson details (exercises, duration)

**Lesson Actions:**
- **Add Lessons**: Click "Add Lessons" to see available unassigned lessons
- **Bulk Assign**: Select multiple lessons and assign at once
- **Remove Lesson**: Click "Remove" to unassign a lesson
- **View Lesson**: Click "View" to see lesson details

#### Subscriber Management
- View all active subscribers
- Subscriber information (name, email, role)
- Subscription date
- Role badges (student/instructor)

### 3. API Endpoints

#### Course Management
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course (admin only)
- `PATCH /api/courses` - Update course (admin only)
- `GET /api/courses/[id]` - Get course details
- `DELETE /api/courses/[id]` - Delete course (admin only)

#### Lesson Assignment
- `GET /api/lessons/unassigned` - Get unassigned lessons (admin only)
- `POST /api/courses/[id]/lessons` - Assign lesson to course (admin only)
- `DELETE /api/courses/[id]/lessons?lessonId=xxx` - Unassign lesson (admin only)

#### Analytics
- `GET /api/courses/[id]/analytics` - Get course analytics (admin only)

## Usage Workflow

### Creating a Course

1. Navigate to `/admin/courses`
2. Click "Create Course" button
3. Fill in:
   - Course Title (required)
   - Description (optional)
4. Click "Create Course"
5. Course is created and set to active by default

### Managing Course Content

1. Navigate to `/admin/courses`
2. Click "Manage" on a course card
3. On the course detail page:
   - **Edit Course**: Click "Edit" to modify title/description
   - **Add Lessons**: Click "Add Lessons" to see available lessons
   - **Assign Lessons**: Select lessons and click "Assign Selected" or assign individually
   - **Remove Lessons**: Click "Remove" next to any lesson
   - **View Subscribers**: Scroll to see all course subscribers

### Course Analytics

The analytics section provides:
- Total lessons and exercises
- Subscriber count
- Submission statistics
- Quiz attempt data
- Completion rates
- Engagement metrics

## Course Status Management

### Activating/Deactivating Courses

1. From course list: Click "Activate" or "Deactivate" button
2. From course detail: Use the status badge (managed via course list)

**Note:** Inactive courses won't appear in the public course listing but remain accessible to admins.

## Lesson Assignment

### Individual Assignment
1. Go to course detail page
2. Click "Add Lessons"
3. Click "Add" on any available lesson

### Bulk Assignment
1. Go to course detail page
2. Click "Add Lessons"
3. Check boxes next to multiple lessons
4. Click "Assign Selected (X)" button

### Unassigning Lessons
1. Go to course detail page
2. Find the lesson in the list
3. Click "Remove" button
4. Lesson is unassigned but not deleted

## Best Practices

1. **Course Organization**
   - Use descriptive course titles
   - Add detailed descriptions for clarity
   - Organize lessons in logical order

2. **Lesson Management**
   - Assign lessons in sequence
   - Review lesson content before assignment
   - Keep unassigned lessons organized

3. **Status Management**
   - Keep courses active when ready for enrollment
   - Deactivate courses under development
   - Reactivate when ready

4. **Analytics Monitoring**
   - Regularly check completion rates
   - Monitor engagement metrics
   - Review subscriber growth

## Permissions

All course management features require **admin** role:
- Creating courses
- Editing courses
- Deleting courses
- Assigning/unassigning lessons
- Viewing analytics
- Managing course status

## Data Relationships

- **Course → Lessons**: One-to-many (lessons can belong to one course)
- **Course → Subscriptions**: One-to-many (many users can subscribe)
- **Lesson → Course**: Many-to-one (optional - lessons can be unassigned)

## Notes

- Deleting a course **does not** delete lessons - they are simply unassigned
- Lessons can be reassigned to different courses
- Course subscriptions remain even if course is deactivated
- Analytics are calculated in real-time from current data

