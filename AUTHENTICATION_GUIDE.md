# Authentication Module Guide

## Overview

The authentication module has been updated to support:
- User registration (students and instructors)
- Password hashing with bcrypt
- Instructor approval by admins
- Course subscriptions
- Admin role for managing instructors

## Database Schema Changes

### New Models

1. **User** - Unified authentication model
   - Email and password (hashed)
   - Role: 'student', 'instructor', or 'admin'
   - Links to Student or Instructor profiles

2. **Course** - Course management
   - Title, description
   - Active status
   - Links to lessons

3. **CourseSubscription** - User course subscriptions
   - Links users to courses
   - Tracks subscription status

### Updated Models

1. **Student** - Now linked to User via userId
2. **Instructor** - Now linked to User via userId
   - Added `isApproved` field
   - Added `approvedBy` and `approvedAt` fields

## Setup Instructions

### 1. Update Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push
```

### 2. Create Admin User

```bash
# Create admin user (default: admin@example.com / admin123)
npm run create-admin

# Or with custom credentials:
ADMIN_EMAIL=your-admin@email.com ADMIN_PASSWORD=your-password npm run create-admin
```

### 3. Create Default Course

```bash
# Create default course and link existing lessons
npm run create-course
```

## User Registration

### Students

1. Navigate to `/auth/register`
2. Select "Student" role
3. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Student ID
   - Registration Number
4. Click "Create Account"
5. Sign in immediately after registration

### Instructors

1. Navigate to `/auth/register`
2. Select "Instructor" role
3. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Department (optional)
   - Title (optional)
4. Click "Create Account"
5. Wait for admin approval
6. Sign in after approval

## Admin Functions

### Approving Instructors

1. Sign in as admin
2. Navigate to `/admin/instructors`
3. Review pending instructor applications
4. Click "Approve Instructor" to approve

### Creating Courses

1. Sign in as admin
2. Use the API endpoint: `POST /api/courses`
   - Body: `{ title: "Course Name", description: "Description" }`

## Course Subscriptions

### For Students

1. Sign in as a student
2. Navigate to `/courses`
3. Browse available courses
4. Click "Subscribe" on desired courses
5. Access subscribed courses from dashboard

### API Endpoints

- `GET /api/courses` - List all courses
- `POST /api/courses/subscribe` - Subscribe to a course
- `GET /api/courses/subscribe` - Get user's subscriptions

## Authentication Flow

### Sign In

1. Navigate to `/auth/signin`
2. Enter email and password
3. System validates credentials
4. For instructors: checks if approved
5. Redirects to appropriate dashboard:
   - Students → `/student`
   - Instructors → `/instructor`
   - Admins → `/admin`

### Password Security

- Passwords are hashed using bcrypt (10 rounds)
- Never stored in plain text
- Minimum 6 characters required

## API Endpoints

### Registration
- `POST /api/auth/register` - Create new account

### Instructor Approval
- `GET /api/auth/approve-instructor` - Get pending instructors (admin only)
- `POST /api/auth/approve-instructor` - Approve instructor (admin only)

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (admin only)
- `POST /api/courses/subscribe` - Subscribe to course
- `GET /api/courses/subscribe` - Get user subscriptions

## Migration Notes

### Existing Data

If you have existing students/instructors:
1. They will need to register new accounts
2. Or you can create a migration script to:
   - Create User records for existing students/instructors
   - Link them to existing profiles
   - Set default passwords (users should change on first login)

### Default Passwords

The old system used `password123` for all users. New system requires:
- Registration with unique passwords
- Password hashing
- No default passwords

## Security Considerations

1. **Password Hashing**: All passwords are hashed with bcrypt
2. **Instructor Approval**: Prevents unauthorized instructor access
3. **Role-Based Access**: Routes protected by role requirements
4. **Session Management**: Uses NextAuth JWT sessions

## Troubleshooting

### "Instructor account pending approval"
- Instructor must wait for admin approval
- Admin can approve at `/admin/instructors`

### "User already exists"
- Email is already registered
- Use sign in instead of register

### "Invalid credentials"
- Check email and password
- Ensure instructor is approved (if instructor role)

### Database Errors
- Run `npm run db:push` to update schema
- Check database connection in `.env.local`

## Next Steps

1. Set up admin account
2. Create initial course
3. Test student registration
4. Test instructor registration and approval
5. Test course subscriptions

