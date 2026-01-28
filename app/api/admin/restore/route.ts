import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    exportedBy: string;
    exportedByEmail: string;
    recordCounts: Record<string, number>;
  };
  data: {
    users?: any[];
    students?: any[];
    instructors?: any[];
    courses?: any[];
    lessons?: any[];
    exercises?: any[];
    grades?: any[];
    gradeCriteria?: any[];
    quizQuestions?: any[];
    quizAttempts?: any[];
    rubrics?: any[];
    rubricCriteria?: any[];
    rubricLevels?: any[];
    rubricCriteriaMappings?: any[];
    rubricLevelMappings?: any[];
    cohorts?: any[];
    courseSubscriptions?: any[];
    courseInstructors?: any[];
    exerciseSubmissions?: any[];
    lessonNotes?: any[];
    pdfResources?: any[];
    unitStandards?: any[];
    competencyUnits?: any[];
    assessorAccreditations?: any[];
    assessmentAuditLogs?: any[];
    [key: string]: any[] | undefined;
  };
}

// POST /api/admin/restore - Restore data from backup
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { backupData, options } = body;

    if (!backupData || !backupData.metadata || !backupData.data) {
      return NextResponse.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      );
    }

    const {
      clearExisting = false,
      skipUsers = false,
      skipGrades = false,
      skipQuizAttempts = false,
    } = options || {};

    // Validate backup version
    if (backupData.metadata.version !== '1.0.0') {
      return NextResponse.json(
        { error: `Unsupported backup version: ${backupData.metadata.version}` },
        { status: 400 }
      );
    }

    // Use transaction for atomic restore
    const result = await prisma.$transaction(async (tx) => {
      const restoreStats: Record<string, number> = {};

      try {
        // Clear existing data if requested
        if (clearExisting) {
          // Delete in reverse order of dependencies
          await tx.assessmentAuditLog.deleteMany({});
          await tx.gradeCriteria.deleteMany({});
          await tx.exerciseSubmission.deleteMany({});
          await tx.grade.deleteMany({});
          await tx.quizAttempt.deleteMany({});
          await tx.quizQuestion.deleteMany({});
          await tx.exercise.deleteMany({});
          await tx.competencyUnit.deleteMany({});
          await tx.lessonNote.deleteMany({});
          await tx.lesson.deleteMany({});
          await tx.courseSubscription.deleteMany({});
          await tx.courseInstructor.deleteMany({});
          await tx.course.deleteMany({});
          await tx.unitStandard.deleteMany({});
          await tx.rubricLevelMapping.deleteMany({});
          await tx.rubricCriteriaMapping.deleteMany({});
          await tx.rubricLevel.deleteMany({});
          await tx.rubricCriteria.deleteMany({});
          await tx.rubric.deleteMany({});
          await tx.pDFResource.deleteMany({});
          await tx.assessorAccreditation.deleteMany({});
          if (!skipUsers) {
            await tx.student.deleteMany({});
            await tx.instructor.deleteMany({});
            await tx.user.deleteMany({});
          }
          await tx.cohort.deleteMany({});
        }

        // Restore data in order of dependencies
        const restoreOperations: Array<{
          key: string;
          restoreFn: () => Promise<void>;
        }> = [];

        // Helper function to create restore operation
        const createRestoreOp = <T extends { createMany: (args: any) => Promise<any> }>(
          key: string,
          model: T,
          skip: boolean
        ) => {
          if (skip || !backupData.data[key] || backupData.data[key]!.length === 0) {
            return;
          }

          const records = backupData.data[key]!;
          const recordsToInsert = records.map((record: any) => {
            const { id, ...rest } = record;
            return rest;
          });

          if (recordsToInsert.length > 0) {
            restoreOperations.push({
              key,
              restoreFn: async () => {
                await model.createMany({
                  data: recordsToInsert,
                  skipDuplicates: true,
                });
                restoreStats[key] = recordsToInsert.length;
              },
            });
          }
        };

        // Create restore operations in order
        createRestoreOp('users', tx.user, skipUsers);
        createRestoreOp('cohorts', tx.cohort, false);
        createRestoreOp('students', tx.student, skipUsers);
        createRestoreOp('instructors', tx.instructor, skipUsers);
        createRestoreOp('assessorAccreditations', tx.assessorAccreditation, skipUsers);
        createRestoreOp('unitStandards', tx.unitStandard, false);
        createRestoreOp('competencyUnits', tx.competencyUnit, false);
        createRestoreOp('courses', tx.course, false);
        createRestoreOp('courseInstructors', tx.courseInstructor, false);
        createRestoreOp('lessons', tx.lesson, false);
        createRestoreOp('exercises', tx.exercise, false);
        createRestoreOp('rubrics', tx.rubric, false);
        createRestoreOp('rubricCriteria', tx.rubricCriteria, false);
        createRestoreOp('rubricLevels', tx.rubricLevel, false);
        createRestoreOp('rubricCriteriaMappings', tx.rubricCriteriaMapping, false);
        createRestoreOp('rubricLevelMappings', tx.rubricLevelMapping, false);
        createRestoreOp('quizQuestions', tx.quizQuestion, false);
        createRestoreOp('lessonNotes', tx.lessonNote, false);
        createRestoreOp('pdfResources', tx.pDFResource, false);
        createRestoreOp('courseSubscriptions', tx.courseSubscription, false);
        createRestoreOp('exerciseSubmissions', tx.exerciseSubmission, false);
        createRestoreOp('grades', tx.grade, skipGrades);
        createRestoreOp('gradeCriteria', tx.gradeCriteria, skipGrades);
        createRestoreOp('quizAttempts', tx.quizAttempt, skipQuizAttempts);
        createRestoreOp('assessmentAuditLogs', tx.assessmentAuditLog, skipGrades);

        // Execute all restore operations
        for (const op of restoreOperations) {
          await op.restoreFn();
        }

        return {
          success: true,
          stats: restoreStats,
          metadata: backupData.metadata,
        };
      } catch (error: any) {
        console.error('Error during restore:', error);
        throw error;
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      stats: result.stats,
      restoredFrom: result.metadata,
    });
  } catch (error: any) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      {
        error: 'Failed to restore backup',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

