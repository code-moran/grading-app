# Fix: Prisma Client Not Updated

## Problem
The error `Cannot read properties of undefined (reading 'findMany')` occurs because the Prisma client hasn't been regenerated after adding the new `CourseInstructor` model.

## Solution

### Step 1: Stop the Development Server
Stop your Next.js dev server (Ctrl+C in the terminal where it's running).

### Step 2: Regenerate Prisma Client
```bash
npm run db:generate
```

Or:
```bash
npx prisma generate
```

### Step 3: Update Database Schema
```bash
npm run db:push
```

Or:
```bash
npx prisma db push
```

### Step 4: Restart Development Server
```bash
npm run dev
```

## Why This Happens
When you add a new model to `prisma/schema.prisma`, the Prisma client needs to be regenerated to include the new model. The client is generated TypeScript code that provides type-safe access to your database models.

If the dev server is running when you try to regenerate, it may lock the generated files, causing the `EPERM` error.

## Verification
After regenerating, you should be able to access:
- `prisma.courseInstructor.findMany()`
- `prisma.courseInstructor.findUnique()`
- `prisma.courseInstructor.create()`
- `prisma.courseInstructor.delete()`

## Note
If you still get errors after regenerating, make sure:
1. The dev server is completely stopped
2. No other processes are using the Prisma client files
3. You have write permissions in the `node_modules/.prisma` directory

