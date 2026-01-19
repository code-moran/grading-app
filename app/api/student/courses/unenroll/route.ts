import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/student/courses/unenroll - Unenroll student from a course
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
    if (userRole !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden. Student access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
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

    // Find subscription (by userId or studentId)
    const subscription = await prisma.courseSubscription.findFirst({
      where: {
        courseId,
        OR: [
          { userId: session.user.id },
          { studentId: student.id },
        ],
      },
      include: {
        student: {
          include: {
            cohort: {
              include: {
                students: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    // Check if student was enrolled via cohort (instructor enrollment)
    // If student belongs to a cohort and other students from the same cohort are enrolled,
    // this is likely an instructor enrollment
    if (subscription.student?.cohortId) {
      const cohort = subscription.student.cohort;
      if (cohort) {
        // Check if other students from the same cohort are enrolled in this course
        const cohortEnrollments = await prisma.courseSubscription.count({
          where: {
            courseId,
            status: 'active',
            student: {
              cohortId: cohort.id,
            },
          },
        });

        // If multiple students from the same cohort are enrolled, it's an instructor enrollment
        if (cohortEnrollments > 1) {
          return NextResponse.json(
            { error: 'Cannot unenroll from a course you were enrolled in by your instructor. Please contact your instructor to unenroll.' },
            { status: 403 }
          );
        }
      }
    }

    // Also check if subscription was created without userId initially (cohort enrollment)
    // This is a heuristic: if subscription was created before user account, it's likely instructor enrollment
    const studentRecord = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        user: true,
      },
    });

    if (studentRecord?.user && subscription.subscribedAt < studentRecord.user.createdAt) {
      // Subscription was created before user account, likely instructor enrollment
      return NextResponse.json(
        { error: 'Cannot unenroll from a course you were enrolled in by your instructor. Please contact your instructor to unenroll.' },
        { status: 403 }
      );
    }

    // Update status to cancelled
    await prisma.courseSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
      },
    });

    return NextResponse.json({
      message: 'Successfully unenrolled from course',
    });
  } catch (error: any) {
    console.error('Unenrollment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unenroll from course' },
      { status: 500 }
    );
  }
}

