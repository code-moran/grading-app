# Vercel Deployment Checklist

Use this checklist to ensure your application is ready for Vercel deployment.

## Pre-Deployment Checklist

### Code & Configuration
- [ ] All code is committed and pushed to repository
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors (`npm run lint`)
- [ ] `.gitignore` includes `.env*` files
- [ ] `vercel.json` is configured (if needed)
- [ ] `package.json` includes `postinstall` script for Prisma

### Database
- [ ] PostgreSQL database is set up (Vercel Postgres, Supabase, Neon, etc.)
- [ ] Database connection string is ready
- [ ] Database allows connections from Vercel IPs
- [ ] SSL is enabled if required
- [ ] Prisma migrations are up to date
- [ ] Database schema matches Prisma schema

### Environment Variables
- [ ] `DATABASE_URL` - Database connection string
- [ ] `NEXTAUTH_SECRET` - Secure random string (generate with `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` - Your Vercel deployment URL
- [ ] Optional: `INIT_DB_SECRET` - For database initialization

### Security
- [ ] No secrets or credentials in code
- [ ] All environment variables are in Vercel dashboard
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database credentials are secure
- [ ] API routes have proper authentication checks

## Deployment Steps

### 1. Connect Repository
- [ ] Import project to Vercel
- [ ] Connect Git repository
- [ ] Select correct branch (usually `master` or `main`)

### 2. Configure Build Settings
- [ ] Framework: Next.js (auto-detected)
- [ ] Build Command: `prisma generate && next build` (or default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Root Directory: `./` (default)

### 3. Set Environment Variables
- [ ] Add `DATABASE_URL` (Production, Preview, Development)
- [ ] Add `NEXTAUTH_SECRET` (Production, Preview, Development)
- [ ] Add `NEXTAUTH_URL` (Production: your domain, Preview: preview URL, Development: localhost)
- [ ] Add any other required variables

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Monitor build logs
- [ ] Wait for deployment to complete

### 5. Run Database Migrations
- [ ] Connect to production database
- [ ] Run `npx prisma migrate deploy`
- [ ] Verify migrations completed successfully

### 6. Seed Database (Optional)
- [ ] Run seed script if needed: `npm run db:seed`
- [ ] Verify initial data is created

### 7. Verify Deployment
- [ ] Visit deployed URL
- [ ] Test authentication (sign in)
- [ ] Test database connections
- [ ] Test key features (courses, lessons, grading)
- [ ] Check for errors in Vercel logs

## Post-Deployment

### Monitoring
- [ ] Enable Vercel Analytics (optional)
- [ ] Enable Speed Insights (optional)
- [ ] Set up error tracking (optional)
- [ ] Monitor build logs for warnings

### Domain Configuration (Optional)
- [ ] Add custom domain in Vercel settings
- [ ] Update `NEXTAUTH_URL` to custom domain
- [ ] Configure DNS records
- [ ] Enable SSL (automatic with Vercel)

### Backup & Recovery
- [ ] Set up database backups
- [ ] Document rollback procedure
- [ ] Test rollback process

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Prisma client generates correctly
- Check for TypeScript errors

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check database allows Vercel IPs
- Ensure SSL is configured if required
- Test connection string locally

### Authentication Errors
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches deployment URL exactly
- Ensure no trailing slashes in URLs
- Check session configuration

### Runtime Errors
- Check Vercel function logs
- Verify environment variables are set
- Check database connection pooling
- Review API route error handling

## Quick Reference

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Run Migrations
```bash
export DATABASE_URL="your-production-url"
npx prisma migrate deploy
```

### Seed Database
```bash
export DATABASE_URL="your-production-url"
npm run db:seed
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
