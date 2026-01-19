import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/instructor/courses/[id] - Get course details (only if instructor is assigned)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    // Check if instructor is assigned to this course
    const courseInstructor = await prisma.courseInstructor.findUnique({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId: instructor.id,
        },
      },
    });

    if (!courseInstructor) {
      return NextResponse.json(
        { error: 'You are not assigned to this course' },
        { status: 403 }
      );
    }

    // Get course with all details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          include: {
            _count: {
              select: {
                exercises: true,
                quizAttempts: true,
              },
            },
          },
          orderBy: {
            number: 'asc',
          },
        },
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                registrationNumber: true,
              },
            },
          },
          where: {
            status: 'active',
          },
        },
        _count: {
          select: {
            lessons: true,
            subscriptions: true,
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

    // Format response
    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        number: lesson.number,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        exerciseCount: lesson._count.exercises,
        quizAttemptCount: lesson._count.quizAttempts,
      })),
      subscribers: course.subscriptions
        .map((sub) => {
          // Handle subscriptions via user (authenticated users)
          if (sub.user) {
            return {
              id: sub.user.id,
              name: sub.user.name,
              email: sub.user.email,
              role: sub.user.role,
              subscribedAt: sub.subscribedAt,
            };
          }
          // Handle subscriptions via student (direct enrollment)
          else if (sub.student) {
            return {
              id: sub.student.id,
              name: sub.student.name,
              email: sub.student.email || '',
              role: 'student',
              subscribedAt: sub.subscribedAt,
            };
          }
          return null;
        })
        .filter((sub) => sub !== null),
      stats: {
        lessonCount: course._count.lessons,
        subscriberCount: course._count.subscriptions,
      },
    };

    return NextResponse.json({ course: formattedCourse }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

