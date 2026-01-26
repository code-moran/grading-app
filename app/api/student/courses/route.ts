import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering since we use getServerSession (which uses headers)
export const dynamic = 'force-dynamic';

// GET /api/student/courses - Get student's enrolled courses
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
    if (userRole !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden. Student access required.' },
        { status: 403 }
      );
    }

    // Get student profile (by userId or find by user's studentProfile)
    let student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    // If not found by userId, try to find via user's studentProfile relation
    if (!student) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { studentProfile: true },
      });
      if (user?.studentProfile) {
        student = { id: user.studentProfile.id };
      }
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Get student record with cohort info
    const studentRecord = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        cohort: {
          include: {
            students: true,
          },
        },
        user: true,
      },
    });

    // Get subscriptions via userId and studentId
    const subscriptions = await prisma.courseSubscription.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: 'active' },
          { studentId: student.id, status: 'active' },
        ],
      },
      include: {
        student: {
          select: {
            cohortId: true,
          },
        },
        course: {
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
            _count: {
              select: {
                lessons: true,
                subscriptions: true,
              },
            },
            courseInstructors: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { subscribedAt: 'desc' },
    });

    // Remove duplicates (in case student is enrolled both ways) and determine enrollment source
    const uniqueCourses = new Map();
    
    // Process subscriptions sequentially to check enrollment source
    for (const sub of subscriptions) {
      if (!uniqueCourses.has(sub.course.id)) {
        // Check if enrollment was via instructor (cohort enrollment)
        let enrolledByInstructor = false;
        
        if (studentRecord?.cohortId) {
          // Check if other students from the same cohort are enrolled in this course
          const cohortEnrollmentsCount = await prisma.courseSubscription.count({
            where: {
              courseId: sub.course.id,
              status: 'active',
              student: {
                cohortId: studentRecord.cohortId,
              },
            },
          });
          
          // If multiple students from the same cohort are enrolled, it's an instructor enrollment
          if (cohortEnrollmentsCount > 1) {
            enrolledByInstructor = true;
          }
        }
        
        // Also check if subscription was created before user account
        if (studentRecord?.user && sub.subscribedAt < studentRecord.user.createdAt) {
          enrolledByInstructor = true;
        }

        uniqueCourses.set(sub.course.id, {
          id: sub.course.id,
          title: sub.course.title,
          description: sub.course.description,
          isActive: sub.course.isActive,
          lessons: sub.course.lessons,
          lessonCount: sub.course._count.lessons,
          subscriberCount: sub.course._count.subscriptions,
          instructors: sub.course.courseInstructors.map((ci) => ({
            id: ci.instructor.id,
            name: ci.instructor.name,
            email: ci.instructor.email,
          })),
          subscribedAt: sub.subscribedAt,
          enrolledByInstructor,
        });
      }
    }

    return NextResponse.json({
      courses: Array.from(uniqueCourses.values()),
    });
  } catch (error: any) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

