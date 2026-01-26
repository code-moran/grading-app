# Vercel Deployment Guide

This guide will help you deploy the Grading App to Vercel.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com))
2. A PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Neon](https://neon.tech))
3. GitHub/GitLab/Bitbucket repository (optional, but recommended)

## Step 1: Prepare Your Repository

Ensure your repository is ready:
- All code is committed and pushed
- `.gitignore` includes `.env*` files
- Build passes locally (`npm run build`)

## Step 2: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to **Storage**
2. Click **Create Database** → **Postgres**
3. Create a new database
4. Copy the connection string (will be available as `POSTGRES_PRISMA_URL`)

### Option B: External PostgreSQL Database

Use any PostgreSQL provider (Supabase, Neon, Railway, etc.) and get your connection string.

**Important:** Ensure your database allows connections from Vercel's IP addresses.

## Step 3: Deploy to Vercel

### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `prisma generate && next build` (or leave default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Step 4: Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

### Required Variables

```env
# Database Connection
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

### Optional Variables

```env
# Database Configuration (if using separate variables)
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Database Initialization (optional)
INIT_DB_SECRET=your-init-secret
```

### Generating NEXTAUTH_SECRET

Generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 5: Run Database Migrations

**Important:** Database migrations are now automatically run during the build process via the `vercel-build` script. This ensures your database schema is always up to date with your code.

The build command runs:
1. `prisma migrate deploy` - Applies pending migrations (safe for production)
2. `prisma generate` - Generates Prisma Client
3. `next build` - Builds the Next.js application

### Manual Migration (If Needed)

If you need to run migrations manually (e.g., if automatic migration fails):

#### Option A: Via Vercel CLI

```bash
# Set environment variables locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

#### Option B: Via Database Provider Console

Some providers (like Supabase) allow running SQL migrations directly in their console.

### Troubleshooting Migrations

If migrations fail during build:
1. Check the build logs in Vercel dashboard
2. Verify `DATABASE_URL` is correctly set
3. Ensure database allows connections from Vercel
4. Check if there are conflicting migrations
5. Run migrations manually using Option A above

## Step 6: Seed Database (Optional)

If you need initial data:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run seed script
npm run db:seed
```

## Step 7: Verify Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Check build logs in Vercel dashboard
3. Test authentication
4. Verify database connections

## Environment-Specific Configuration

### Development

```env
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/grading_app
```

### Preview (Vercel Preview Deployments)

```env
NEXTAUTH_URL=https://your-branch.vercel.app
DATABASE_URL=your-production-database-url
```

### Production

```env
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=your-production-database-url
```

## Build Configuration

The project is configured with:

- **Build Command**: `npm run vercel-build` (runs migrations, generates Prisma Client, and builds the app)
- **Vercel Build Script**: `prisma migrate deploy && prisma generate && next build`
- **Postinstall Script**: Automatically runs `prisma generate` after `npm install`
- **Framework**: Next.js 14 (detected automatically)

**Note:** The `vercel-build` script automatically runs database migrations during deployment. This ensures your production database schema stays in sync with your code.

## Database Connection Pooling

For production, consider using connection pooling:

### Vercel Postgres
- Automatically handles connection pooling
- Use `POSTGRES_PRISMA_URL` for Prisma
- Use `POSTGRES_URL_NON_POOLING` for migrations

### External Databases
- Use a connection pooler like PgBouncer
- Or use a managed service that provides pooling

## Troubleshooting

### Build Fails: Prisma Client Not Generated

**Solution:** Ensure `postinstall` script is in `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Errors

**Check:**
1. `DATABASE_URL` is set correctly in Vercel
2. Database allows connections from Vercel IPs
3. SSL is enabled if required (add `?sslmode=require` to connection string)

### NextAuth Errors

**Check:**
1. `NEXTAUTH_SECRET` is set and is a secure random string
2. `NEXTAUTH_URL` matches your deployment URL exactly
3. No trailing slashes in URLs

### Migration Errors

**Common Issues:**

1. **Migrations fail during build:**
   - Check that `DATABASE_URL` is set in Vercel environment variables
   - Verify database allows connections from Vercel IPs
   - Check build logs for specific error messages
   - Ensure SSL is enabled if required (add `?sslmode=require` to connection string)

2. **"No migrations found" error:**
   - Ensure `prisma/migrations` folder is committed to your repository
   - Verify migrations exist in the project

3. **"Migration already applied" warning:**
   - This is normal and safe to ignore
   - `prisma migrate deploy` only applies pending migrations

**Solution:** If automatic migrations fail, run manually:
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

**Note:** After fixing migration issues, you may need to redeploy or trigger a new build in Vercel.

## Performance Optimization

### Enable Edge Runtime (Optional)

For API routes that don't need Node.js features, add:

```typescript
export const runtime = 'edge';
```

### Database Query Optimization

- Use Prisma's `select` to fetch only needed fields
- Add database indexes for frequently queried fields
- Use connection pooling

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
- **Analytics** → Enable Web Analytics
- **Speed Insights** → Enable

### Error Tracking

Consider adding:
- Sentry for error tracking
- Logtail for log aggregation

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] Database credentials are stored in Vercel environment variables (not in code)
- [ ] `.env*` files are in `.gitignore`
- [ ] Database allows connections only from Vercel IPs
- [ ] SSL is enabled for database connections
- [ ] API routes have proper authentication checks

## Continuous Deployment

Once connected to Git:
- Every push to `master` triggers production deployment
- Pull requests create preview deployments
- Environment variables are automatically available

## Rollback

If deployment fails:
1. Go to Vercel dashboard
2. Navigate to **Deployments**
3. Find the last working deployment
4. Click **⋯** → **Promote to Production**

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

## Support

For deployment issues:
1. Check Vercel build logs
2. Review environment variables
3. Verify database connectivity
4. Check Next.js and Prisma documentation
