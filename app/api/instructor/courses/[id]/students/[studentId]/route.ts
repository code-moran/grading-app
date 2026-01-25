import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/instructor/courses/[id]/students/[studentId] - Get detailed student information for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
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

    const courseId = params.id;
    const studentId = params.studentId;

    // Verify instructor has access to this course
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        courses: {
          where: { courseId },
        },
      },
    });

    if (!instructor || instructor.courses.length === 0) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Get student information
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get course with lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            title: true,
            description: true,
            duration: true,
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

    // Get student's grades for this course
    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        lesson: {
          courseId,
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
          },
        },
      },
      orderBy: {
        gradedAt: 'desc',
      },
    });

    // Get quiz attempts for this course
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        studentId,
        lesson: {
          courseId,
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get exercise submissions for this course
    const exerciseSubmissions = await prisma.exerciseSubmission.findMany({
      where: {
        studentId,
        exercise: {
          lesson: {
            courseId,
          },
        },
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            lesson: {
              select: {
                id: true,
                number: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Calculate statistics
    const totalLessons = course.lessons.length;
    const completedLessons = new Set([
      ...grades.map((g) => g.lessonId),
      ...quizAttempts.filter((q) => q.passed).map((q) => q.lessonId),
    ]).size;

    const averageGrade =
      grades.length > 0
        ? Math.round(
            grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length
          )
        : 0;

    const totalPoints = grades.reduce((sum, grade) => sum + grade.totalPoints, 0);
    const maxPossiblePoints = grades.reduce(
      (sum, grade) => sum + grade.maxPossiblePoints,
      0
    );

    // Get subscription info
    const subscription = await prisma.courseSubscription.findFirst({
      where: {
        courseId,
        studentId,
        status: 'active',
      },
      select: {
        subscribedAt: true,
      },
    });

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email || student.user?.email,
        registrationNumber: student.registrationNumber,
        cohort: student.cohort,
        subscribedAt: subscription?.subscribedAt,
      },
      course: {
        id: course.id,
        title: course.title,
        lessons: course.lessons,
      },
      stats: {
        totalLessons,
        completedLessons,
        completionPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        averageGrade,
        totalGrades: grades.length,
        totalQuizAttempts: quizAttempts.length,
        totalSubmissions: exerciseSubmissions.length,
        totalPoints,
        maxPossiblePoints,
      },
      grades,
      quizAttempts,
      exerciseSubmissions,
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student details' },
      { status: 500 }
    );
  }
}
