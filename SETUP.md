# Database Setup Instructions

This guide will help you set up the PostgreSQL database for the Web Design Grading App.

## Prerequisites

1. **PostgreSQL Installation**
   - Install PostgreSQL 12.0 or later
   - Make sure PostgreSQL service is running
   - Note your PostgreSQL username and password

2. **Database Creation**
   ```sql
   -- Connect to PostgreSQL as superuser
   psql -U postgres
   
   -- Create database
   CREATE DATABASE grading_app;
   
   -- Create user (optional, you can use existing user)
   CREATE USER grading_user WITH PASSWORD 'your_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE grading_app TO grading_user;
   
   -- Exit psql
   \q
   ```

## Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp env.template .env.local
   ```

2. **Edit `.env.local` with your database credentials:**
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://grading_user:your_password@localhost:5432/grading_app
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=grading_app
   DB_USER=grading_user
   DB_PASSWORD=your_password
   
   # Application Configuration
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Database Initialization (optional)
   INIT_DB_SECRET=init-secret
   ```

## Database Setup with Prisma

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```
   
   This generates the Prisma client based on your schema.

3. **Push schema to database:**
   ```bash
   npm run db:push
   ```
   
   This creates all the necessary tables and relationships in your database.

4. **Seed the database with initial data:**
   ```bash
   npm run db:seed
   ```
   
   This populates the database with lessons and exercises.

5. **Alternative: Use migrations (recommended for production):**
   ```bash
   npm run db:migrate
   ```
   
   This creates and runs database migrations.

6. **Verify the setup:**
   ```bash
   # Open Prisma Studio to view your data
   npm run db:studio
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check if the port (5432) is correct
   - Verify firewall settings
   - Run `npm run test-db` to diagnose connection issues

2. **Authentication Failed**
   - Double-check username and password
   - Ensure the user has proper privileges
   - Try connecting with psql first: `psql -U your_username -d grading_app`

3. **Database Not Found**
   - Make sure the database `grading_app` exists
   - Check the database name in your `.env.local`
   - Create the database: `createdb -U your_username grading_app`

4. **Permission Denied**
   - Grant proper privileges to your user
   - Ensure the user can create tables and indexes
   - Run as superuser or grant necessary permissions

5. **"relation does not exist" Error**
   - This means the schema wasn't created properly
   - Run `npm run create-schema` to create tables
   - Check the console output for specific error messages

6. **Schema Creation Fails**
   - Check if the user has CREATE privileges
   - Ensure the database is empty or you have DROP privileges
   - Try running individual SQL statements manually

### Manual Database Setup

If the automated setup fails, you can manually run the SQL:

1. **Connect to your database:**
   ```bash
   psql -U your_username -d grading_app
   ```

2. **Run the schema file:**
   ```sql
   \i lib/schema.sql
   ```

3. **Initialize with seed data:**
   ```bash
   npm run init-db
   ```

## Development

Once the database is set up:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the application:**
   - Navigate to http://localhost:3000
   - The application should load with all lessons and exercises

## Production Deployment

For production deployment:

1. **Use a managed PostgreSQL service** (AWS RDS, Google Cloud SQL, etc.)
2. **Update environment variables** with production credentials
3. **Enable SSL** in your database configuration
4. **Set strong passwords** and secrets
5. **Configure connection pooling** for better performance

## Backup and Recovery

### Backup
```bash
pg_dump -U your_username -h localhost grading_app > backup.sql
```

### Restore
```bash
psql -U your_username -h localhost grading_app < backup.sql
```

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your database connection with `psql`
3. Ensure all environment variables are set correctly
4. Check that PostgreSQL is running and accessible
