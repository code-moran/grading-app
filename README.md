# Web Design Grading App

A comprehensive Next.js application for grading practical exercises in web design courses. This tool provides a structured approach to assessing student work using detailed rubrics based on the enhanced lesson plans.

## Features

### Core Features
- **Comprehensive Lesson Coverage**: Includes all 22 enhanced lesson plans from the web design curriculum
- **Rubric-Based Grading**: Detailed assessment criteria for each practical exercise
- **Student Management**: Add, edit, and manage student information
- **Bulk Student Upload**: Upload students via CSV with registration numbers and names
- **Dynamic Exercise Management**: Add custom exercises to any lesson with custom rubrics
- **Grade Tracking**: View and analyze student performance across all lessons
- **Bulk Grade Export**: Download all grades with best grade selection converted to 100%
- **Real-time Feedback**: Provide detailed feedback for each assessment criteria
- **Grade Analytics**: Visual representation of grade distribution and performance trends

### Course Management
- **Instructor Course Dashboard**: Manage courses assigned to instructors
- **Course Detail Pages**: Tabbed interface for lessons, subscribers, and cohorts
- **Create Lessons**: Create new lessons directly from course pages
- **Lesson Assignment**: Assign existing lessons to courses or create new ones
- **Student Enrollment**: Track student subscriptions and enrollment dates

### Student Tracking
- **Student Details Modal**: Comprehensive view of student progress with tabbed interface
  - Overview: Student info, statistics, and progress
  - Grades: All grades with clickable navigation to grading page
  - Quizzes: Quiz attempts and scores
  - Submissions: Exercise submissions with clickable navigation
- **Clickable Navigation**: Click grades or submissions to navigate directly to grading page
- **Progress Tracking**: Visual progress bars and completion statistics

### Cohort Management
- **Cohort Details Modal**: View detailed cohort information
  - Student statistics table
  - Average grades and completion rates
  - Recent grades for all students
- **CSV Export**: Export cohort grades in pivot table format
  - One column per exercise
  - Includes all students (even without grades)
  - Only exercises with grades are included
  - Summary columns for averages and totals

### TVETA/CBET Compliance
- **Competency-Based Assessment**: Automatic competency calculation (≥70% = Competent)
- **Unit Standards**: Link courses to TVETA unit standards
- **KNQF Alignment**: Track Kenya National Qualifications Framework levels
- **Assessor Credentials**: Track assessor, verifier, and moderator roles
- **Audit Logging**: Complete audit trail for all assessment actions
- **Compliance Export**: CSV exports include all TVETA/CBET required fields

### User Interface
- **Modern UI/UX**: Progressive disclosure, skeleton loaders, smooth transitions
- **Tabbed Interfaces**: Organized content with tabs for better navigation
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Color-Coded Status**: Visual indicators for grades, competency, and status
- **Search & Filter**: Advanced filtering throughout the application

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- PostgreSQL 12.0 or later
- A PostgreSQL database named `grading_app`

### Installation

1. Navigate to the grading app directory:
   ```bash
   cd grading-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.template .env.local
   ```
   
   Edit `.env.local` with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/grading_app
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=grading_app
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

4. Set up the database with Prisma:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database
   npm run db:seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
grading-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── students/      # Student management API
│   │   ├── grades/        # Grade management API
│   │   ├── lessons/       # Lesson management API
│   │   └── init-db/       # Database initialization API
│   ├── grade/             # Grading interface
│   ├── students/          # Student management
│   ├── lessons/           # Lesson management
│   ├── grades/            # Grades overview
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions and data
│   ├── database.ts        # Database connection and queries
│   ├── init-db.ts         # Database initialization
│   ├── schema.sql         # Database schema
│   ├── lessons.ts         # Lesson data and rubrics
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
├── scripts/               # Setup and utility scripts
│   └── setup-db.js        # Database setup script
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Usage

### 1. Dashboard
- View all available lessons
- Access quick statistics
- Navigate to different sections

### 2. Grading Interface
- Select a lesson and exercise
- Choose a student to grade
- Use the rubric to assess each criteria
- Provide detailed feedback
- Save grades automatically

### 3. Student Management
- Add new students individually or in bulk
- Upload students via CSV (registration number, name)
- Edit student information
- Search and filter students
- Download student list as CSV
- Manage class assignments

### 4. Lesson Management
- View all lessons and exercises
- Add custom exercises to any lesson
- Create custom rubrics with multiple criteria
- Manage assessment criteria and weights
- Edit exercise details and descriptions

### 5. Grades Overview
- View all grades across lessons
- Filter by lesson or student
- Analyze performance trends
- Bulk download grades with best grade selection
- Export grade data as CSV with detailed breakdown

## Lesson Coverage

The application includes comprehensive rubrics for all 22 enhanced lessons:

1. **Introduction to HTML** - Basic HTML structure and elements
2. **JavaScript Functions** - Function declaration, parameters, return values
3. **jQuery Introduction** - Library setup and basic usage
4. **jQuery Syntax and Selectors** - Various selector types and syntax
5. **jQuery Events** - Event handling and management
6. **jQuery DOM Manipulation** - Content and element manipulation
7. **Project 1 Part 2** - Advanced portfolio features
8. **CSS Grid Layout** - Complex layout implementation
9. **CSS Animations** - Transitions and keyframe animations
10. **Advanced CSS Selectors** - Complex selector patterns
11. **JavaScript Conditionals** - Control flow and logical operators
12. **JavaScript Loops** - Various loop structures
13. **JavaScript Objects** - Object creation and manipulation
14. **Advanced JavaScript Events** - Event flow and delegation
15. **Asynchronous JavaScript** - Callbacks and promises
16. **Async/Await** - Modern asynchronous programming
17. **Web APIs and Fetch** - HTTP requests and API integration
18. **Client-Side Storage** - localStorage and sessionStorage
19. **Version Control with Git** - Git workflow and commands
20. **GitHub and Remote Repos** - Repository management
21. **Web Hosting and Deployment** - Website deployment

## Rubric Structure

Each lesson includes a comprehensive rubric with:

- **Assessment Criteria**: Specific skills and concepts to evaluate
- **Performance Levels**: 4-point scale (Excellent, Good, Satisfactory, Needs Improvement)
- **Weighted Scoring**: Each criteria has a specific weight percentage
- **Detailed Descriptions**: Clear expectations for each performance level
- **Feedback Areas**: Space for specific comments on each criteria

## Customization

### Adding New Lessons
1. Update `lib/lessons.ts` with new lesson data
2. Define rubric criteria and performance levels
3. Add exercises with appropriate point values

### Modifying Rubrics
1. Edit the rubric structure in `lib/lessons.ts`
2. Update criteria descriptions and weights
3. Adjust performance level descriptions

### Styling Changes
1. Modify `tailwind.config.js` for theme changes
2. Update `app/globals.css` for global styles
3. Customize component styles in individual pages

## Database Management

The application uses PostgreSQL for data persistence with the following features:

### Database Schema
- **Students**: Store student information with registration numbers
- **Lessons**: Manage lesson content and metadata
- **Exercises**: Store exercises with custom rubrics
- **Rubrics**: Flexible rubric system with criteria and levels
- **Grades**: Track student grades with detailed criteria breakdown
- **Grading Sessions**: Monitor grading progress

### Database Operations
- **Connection Pooling**: Efficient database connections
- **Transactions**: ACID compliance for data integrity
- **Indexes**: Optimized queries for better performance
- **Cascading Deletes**: Maintain referential integrity
- **Automatic Timestamps**: Track creation and update times

### Database Setup Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# Reset database (careful!)
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Environment Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/grading_app
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grading_app
DB_USER=your_username
DB_PASSWORD=your_password
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Web Design Lesson Plans curriculum and is intended for educational use.

## Support

For questions or issues:
1. Check the documentation
2. Review the lesson plans
3. Create an issue in the repository
4. Contact the development team

## Documentation

For detailed feature documentation, see:
- [FEATURES.md](./FEATURES.md) - Complete features documentation
- [TVETA_CBET_SUMMARY.md](./TVETA_CBET_SUMMARY.md) - TVETA/CBET compliance details
- [INSTRUCTOR_COURSE_MANAGEMENT.md](./INSTRUCTOR_COURSE_MANAGEMENT.md) - Course management guide

## Future Enhancements

- **PDF Reports**: Generate PDF reports for grades and assessments
- **Advanced Analytics**: Performance trends and predictive insights
- **Bulk Operations**: Mass grading and import features
- **Integration**: LMS and gradebook integration
- **Notifications**: Email alerts and reminders for grades
- **Mobile App**: Native mobile application support
- **Real-time Collaboration**: Live collaboration features for instructors
