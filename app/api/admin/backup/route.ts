import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface BackupMetadata {
  version: string;
  timestamp: string;
  exportedBy: string;
  exportedByEmail: string;
  databaseVersion?: string;
  recordCounts: {
    users: number;
    students: number;
    instructors: number;
    courses: number;
    lessons: number;
    exercises: number;
    grades: number;
    quizzes: number;
    rubrics: number;
    cohorts: number;
    [key: string]: number;
  };
}

interface BackupData {
  metadata: BackupMetadata;
  data: {
    users: any[];
    students: any[];
    instructors: any[];
    courses: any[];
    lessons: any[];
    exercises: any[];
    grades: any[];
    gradeCriteria: any[];
    quizQuestions: any[];
    quizAttempts: any[];
    rubrics: any[];
    rubricCriteria: any[];
    rubricLevels: any[];
    rubricCriteriaMappings: any[];
    rubricLevelMappings: any[];
    cohorts: any[];
    courseSubscriptions: any[];
    courseInstructors: any[];
    exerciseSubmissions: any[];
    lessonNotes: any[];
    pdfResources: any[];
    unitStandards: any[];
    competencyUnits: any[];
    assessorAccreditations: any[];
    assessmentAuditLogs: any[];
    [key: string]: any[];
  };
}

// GET /api/admin/backup - Create a backup of all database data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all data from database
    const [
      users,
      students,
      instructors,
      courses,
      lessons,
      exercises,
      grades,
      gradeCriteria,
      quizQuestions,
      quizAttempts,
      rubrics,
      rubricCriteria,
      rubricLevels,
      rubricCriteriaMappings,
      rubricLevelMappings,
      cohorts,
      courseSubscriptions,
      courseInstructors,
      exerciseSubmissions,
      lessonNotes,
      pdfResources,
      unitStandards,
      competencyUnits,
      assessorAccreditations,
      assessmentAuditLogs,
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.student.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.instructor.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.course.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.lesson.findMany({
        orderBy: [{ courseId: 'asc' }, { number: 'asc' }],
      }),
      prisma.exercise.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.grade.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.gradeCriteria.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.quizQuestion.findMany({
        orderBy: [{ lessonId: 'asc' }, { order: 'asc' }],
      }),
      prisma.quizAttempt.findMany({
        orderBy: { completedAt: 'desc' },
      }),
      prisma.rubric.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.rubricCriteria.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.rubricLevel.findMany({
        orderBy: { points: 'desc' },
      }),
      prisma.rubricCriteriaMapping.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.rubricLevelMapping.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.cohort.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.courseSubscription.findMany({
        orderBy: { subscribedAt: 'asc' },
      }),
      prisma.courseInstructor.findMany({
        orderBy: { assignedAt: 'asc' },
      }),
      prisma.exerciseSubmission.findMany({
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.lessonNote.findMany({
        orderBy: [{ lessonId: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.pDFResource.findMany({
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.unitStandard.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.competencyUnit.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.assessorAccreditation.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.assessmentAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Create metadata
    const metadata: BackupMetadata = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      exportedBy: (session.user as any).name || 'Unknown',
      exportedByEmail: (session.user as any).email || 'Unknown',
      recordCounts: {
        users: users.length,
        students: students.length,
        instructors: instructors.length,
        courses: courses.length,
        lessons: lessons.length,
        exercises: exercises.length,
        grades: grades.length,
        gradeCriteria: gradeCriteria.length,
        quizzes: quizQuestions.length + quizAttempts.length, // Combined count
        quizQuestions: quizQuestions.length,
        quizAttempts: quizAttempts.length,
        rubrics: rubrics.length,
        rubricCriteria: rubricCriteria.length,
        rubricLevels: rubricLevels.length,
        rubricCriteriaMappings: rubricCriteriaMappings.length,
        rubricLevelMappings: rubricLevelMappings.length,
        cohorts: cohorts.length,
        courseSubscriptions: courseSubscriptions.length,
        courseInstructors: courseInstructors.length,
        exerciseSubmissions: exerciseSubmissions.length,
        lessonNotes: lessonNotes.length,
        pdfResources: pdfResources.length,
        unitStandards: unitStandards.length,
        competencyUnits: competencyUnits.length,
        assessorAccreditations: assessorAccreditations.length,
        assessmentAuditLogs: assessmentAuditLogs.length,
      },
    };

    // Create backup data structure
    const backupData: BackupData = {
      metadata,
      data: {
        users,
        students,
        instructors,
        courses,
        lessons,
        exercises,
        grades,
        gradeCriteria,
        quizQuestions,
        quizAttempts,
        rubrics,
        rubricCriteria,
        rubricLevels,
        rubricCriteriaMappings,
        rubricLevelMappings,
        cohorts,
        courseSubscriptions,
        courseInstructors,
        exerciseSubmissions,
        lessonNotes,
        pdfResources,
        unitStandards,
        competencyUnits,
        assessorAccreditations,
        assessmentAuditLogs,
      },
    };

    // Convert to JSON
    const jsonData = JSON.stringify(backupData, null, 2);

    // Return as downloadable file
    const filename = `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;

    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup', details: error.message },
      { status: 500 }
    );
  }
}
