import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get course analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    const { id: courseId } = params;

    // Get course with related data
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          include: {
            _count: {
              select: {
                exercises: true,
                grades: true,
                quizAttempts: true,
              },
            },
          },
        },
        subscriptions: {
          where: { status: 'active' },
          include: {
            user: {
              include: {
                studentProfile: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Calculate analytics
    const totalLessons = course.lessons.length;
    const totalExercises = course.lessons.reduce(
      (sum, lesson) => sum + lesson._count.exercises,
      0
    );
    const totalSubmissions = course.lessons.reduce(
      (sum, lesson) => sum + lesson._count.grades,
      0
    );
    const totalQuizAttempts = course.lessons.reduce(
      (sum, lesson) => sum + lesson._count.quizAttempts,
      0
    );
    const activeSubscribers = course.subscriptions.length;

    // Calculate completion rates
    const studentsWithSubmissions = new Set(
      course.lessons.flatMap((lesson) =>
        // This would need to query grades to get actual student count
        []
      )
    ).size;

    const averageCompletionRate =
      activeSubscribers > 0
        ? Math.round((totalSubmissions / (activeSubscribers * totalExercises)) * 100)
        : 0;

    return NextResponse.json({
      analytics: {
        totalLessons,
        totalExercises,
        totalSubmissions,
        totalQuizAttempts,
        activeSubscribers,
        averageCompletionRate,
      },
      course: {
        id: course.id,
        title: course.title,
        isActive: course.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error fetching course analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course analytics' },
      { status: 500 }
    );
  }
}

