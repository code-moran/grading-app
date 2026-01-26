import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering since we use getServerSession (which uses headers)
export const dynamic = 'force-dynamic';

// GET /api/instructor/stats - Get statistics for the logged-in instructor
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
    if (userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Instructor access required.' },
        { status: 403 }
      );
    }

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        courses: {
          include: {
            course: {
              include: {
                lessons: {
                  include: {
                    _count: {
                      select: {
                        exercises: true,
                        grades: true,
                        quizAttempts: true,
                        quizQuestions: true,
                      },
                    },
                  },
                },
                subscriptions: {
                  where: { status: 'active' },
                },
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const courses = instructor.courses.map((ci) => ci.course);
    const totalCourses = courses.length;
    const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
    const totalExercises = courses.reduce(
      (sum, course) =>
        sum + course.lessons.reduce((lessonSum, lesson) => lessonSum + lesson._count.exercises, 0),
      0
    );
    const totalSubscribers = courses.reduce((sum, course) => sum + course.subscriptions.length, 0);
    const totalGrades = courses.reduce(
      (sum, course) =>
        sum + course.lessons.reduce((lessonSum, lesson) => lessonSum + lesson._count.grades, 0),
      0
    );
    const totalQuizAttempts = courses.reduce(
      (sum, course) =>
        sum +
        course.lessons.reduce((lessonSum, lesson) => lessonSum + lesson._count.quizAttempts, 0),
      0
    );
    const totalQuizQuestions = courses.reduce(
      (sum, course) =>
        sum +
        course.lessons.reduce((lessonSum, lesson) => lessonSum + lesson._count.quizQuestions, 0),
      0
    );

    // Get recent courses (last 3)
    const recentCourses = courses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((course) => ({
        id: course.id,
        title: course.title,
        lessonCount: course.lessons.length,
        subscriberCount: course.subscriptions.length,
      }));

    // Get lessons with pending grading (lessons with exercises but no grades)
    const lessonsNeedingGrading = courses
      .flatMap((course) =>
        course.lessons
          .filter(
            (lesson) => lesson._count.exercises > 0 && lesson._count.grades < lesson._count.exercises
          )
          .map((lesson) => ({
            id: lesson.id,
            number: lesson.number,
            title: lesson.title,
            courseId: course.id,
            courseTitle: course.title,
            exerciseCount: lesson._count.exercises,
            gradedCount: lesson._count.grades,
          }))
      )
      .slice(0, 5);

    return NextResponse.json(
      {
        stats: {
          totalCourses,
          totalLessons,
          totalExercises,
          totalSubscribers,
          totalGrades,
          totalQuizAttempts,
          totalQuizQuestions,
        },
        recentCourses,
        lessonsNeedingGrading,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching instructor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

