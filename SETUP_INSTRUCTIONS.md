# Setup Instructions for Authentication Module

## Important: Database Schema Update Required

After adding the new authentication module, you **must** update your database schema before the application will work.

## Step 1: Stop the Development Server

If your development server is running, stop it first (Ctrl+C) to avoid file lock issues.

## Step 2: Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma client with the new User, Course, and CourseSubscription models.

## Step 3: Push Schema to Database

```bash
npx prisma db push
```

This updates your database with the new tables and relationships.

## Step 4: Create Admin User

```bash
npm run create-admin
```

Or with custom credentials:
```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword npm run create-admin
```

## Step 5: Create Default Course

```bash
npm run create-course
```

This creates a default course and links existing lessons to it.

## Step 6: Restart Development Server

```bash
npm run dev
```

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'findUnique')"

This means the Prisma client hasn't been generated or the schema hasn't been pushed to the database. Follow steps 2 and 3 above.

### Error: "EPERM: operation not permitted"

This happens when the dev server is running. Stop the server, run `npx prisma generate`, then restart.

### Error: "Table 'users' does not exist"

The database schema hasn't been pushed. Run `npx prisma db push`.

### Error: "Model 'Course' does not exist"

The Prisma client is out of date. Run `npx prisma generate`.

## Verification

After setup, you should be able to:
1. Visit `/auth/register` and create a student account
2. Visit `/auth/register` and create an instructor account (requires admin approval)
3. Sign in with created accounts
4. Visit `/courses` to see available courses
5. Subscribe to courses (after signing in)

