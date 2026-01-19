import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/courses/[id]/cohorts - Get cohorts enrolled in a course
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
    if (!['admin', 'instructor'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const courseId = params.id;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get all active subscriptions for this course (both by userId and studentId)
    const subscriptions = await prisma.courseSubscription.findMany({
      where: {
        courseId,
        status: 'active',
      },
      include: {
        user: {
          include: {
            studentProfile: {
              include: {
                cohort: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isActive: true,
                  },
                },
              },
            },
          },
        },
        student: {
          include: {
            cohort: {
              select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    // Group by cohort
    const cohortMap = new Map<string, {
      id: string;
      name: string;
      description: string | null;
      isActive: boolean;
      enrolledStudents: number;
      totalStudents: number;
    }>();

    // Get all cohorts with their student counts
    const allCohorts = await prisma.cohort.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    // Initialize all cohorts
    for (const cohort of allCohorts) {
      cohortMap.set(cohort.id, {
        id: cohort.id,
        name: cohort.name,
        description: cohort.description || null,
        isActive: cohort.isActive,
        enrolledStudents: 0,
        totalStudents: cohort._count.students,
      });
    }

    // Count enrolled students per cohort
    for (const subscription of subscriptions) {
      let cohortId: string | null = null;

      // Check if subscription is via user (with studentProfile)
      if (subscription.user?.studentProfile?.cohortId) {
        cohortId = subscription.user.studentProfile.cohortId;
      }
      // Check if subscription is directly via student
      else if (subscription.student?.cohortId) {
        cohortId = subscription.student.cohortId;
      }

      if (cohortId) {
        const cohortData = cohortMap.get(cohortId);
        if (cohortData) {
          cohortData.enrolledStudents++;
        }
      }
    }

    // Filter to only cohorts with enrolled students
    const enrolledCohorts = Array.from(cohortMap.values()).filter(
      (cohort) => cohort.enrolledStudents > 0
    );

    return NextResponse.json({
      cohorts: enrolledCohorts,
      totalCohorts: enrolledCohorts.length,
    });
  } catch (error: any) {
    console.error('Error fetching course cohorts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course cohorts' },
      { status: 500 }
    );
  }
}

