import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/cleanup-orphaned
 * Admin-only endpoint to clean up orphaned lessons and exercises
 * Orphaned = lessons/exercises linked to non-existent courses/lessons
 */
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
    const { dryRun = true } = body;

    // Step 1: Get all valid course IDs
    const courses = await prisma.course.findMany({
      select: { id: true },
    });
    const validCourseIds = new Set(courses.map((c) => c.id));

    // Step 2: Find lessons with invalid courseId
    const allLessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        courseId: true,
        number: true,
      },
    });

    const orphanedLessons = allLessons.filter(
      (lesson) => !validCourseIds.has(lesson.courseId)
    );

    // Step 3: Find exercises linked to orphaned lessons
    const orphanedLessonIds = orphanedLessons.map((l) => l.id);
    const orphanedExercises = orphanedLessonIds.length > 0
      ? await prisma.exercise.findMany({
          where: {
            lessonId: {
              in: orphanedLessonIds,
            },
          },
          select: {
            id: true,
            title: true,
            lessonId: true,
            _count: {
              select: {
                grades: true,
                exerciseSubmissions: true,
              },
            },
          },
        })
      : [];

    // Step 4: Find exercises linked to non-existent lessons
    const allExercises = await prisma.exercise.findMany({
      select: {
        id: true,
        title: true,
        lessonId: true,
      },
    });
    const validLessonIds = new Set(allLessons.map((l) => l.id));
    const exercisesWithInvalidLessons = allExercises.filter(
      (exercise) => !validLessonIds.has(exercise.lessonId)
    );

    const result = {
      dryRun,
      summary: {
        validCourses: validCourseIds.size,
        totalLessons: allLessons.length,
        orphanedLessons: orphanedLessons.length,
        totalExercises: allExercises.length,
        orphanedExercises: orphanedExercises.length,
        exercisesWithInvalidLessons: exercisesWithInvalidLessons.length,
      },
      orphanedLessons: orphanedLessons.map((l) => ({
        id: l.id,
        number: l.number,
        title: l.title,
        courseId: l.courseId,
      })),
      orphanedExercises: [
        ...orphanedExercises.map((e) => ({
          id: e.id,
          title: e.title,
          lessonId: e.lessonId,
          hasGrades: e._count.grades > 0,
          hasSubmissions: e._count.exerciseSubmissions > 0,
        })),
        ...exercisesWithInvalidLessons.map((e) => ({
          id: e.id,
          title: e.title,
          lessonId: e.lessonId,
          hasGrades: false,
          hasSubmissions: false,
        })),
      ],
    };

    if (!dryRun && (orphanedLessons.length > 0 || exercisesWithInvalidLessons.length > 0)) {
      // Delete orphaned exercises first (cascades to grades/submissions)
      if (orphanedExercises.length > 0) {
        await prisma.exercise.deleteMany({
          where: {
            lessonId: {
              in: orphanedLessonIds,
            },
          },
        });
      }

      // Delete exercises with invalid lessons
      if (exercisesWithInvalidLessons.length > 0) {
        await prisma.exercise.deleteMany({
          where: {
            id: {
              in: exercisesWithInvalidLessons.map((e) => e.id),
            },
          },
        });
      }

      // Delete orphaned lessons (cascades to quiz attempts, quiz questions)
      if (orphanedLessons.length > 0) {
        await prisma.lesson.deleteMany({
          where: {
            id: {
              in: orphanedLessonIds,
            },
          },
        });
      }

      (result.summary as any).deletedLessons = orphanedLessons.length;
      (result.summary as any).deletedExercises = orphanedExercises.length + exercisesWithInvalidLessons.length;
    }

    return NextResponse.json({
      message: dryRun
        ? 'Dry run completed. No data was deleted.'
        : 'Cleanup completed successfully.',
      ...result,
    });
  } catch (error: any) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup orphaned data', details: error.message },
      { status: 500 }
    );
  }
}
