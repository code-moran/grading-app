import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/instructor/cohorts - Get cohorts related to the logged-in instructor
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
              select: {
                id: true,
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

    // Get course IDs that the instructor teaches
    const instructorCourseIds = instructor.courses.map((ci) => ci.course.id);

    if (instructorCourseIds.length === 0) {
      return NextResponse.json({ cohorts: [] });
    }

    // Find cohorts that have students enrolled in the instructor's courses
    // Get all students enrolled in instructor's courses
    const enrolledStudents = await prisma.courseSubscription.findMany({
      where: {
        courseId: { in: instructorCourseIds },
        status: 'active',
        studentId: { not: null },
      },
      select: {
        studentId: true,
        courseId: true,
      },
      distinct: ['studentId'],
    });

    const studentIds = enrolledStudents
      .map((sub) => sub.studentId)
      .filter((id): id is string => id !== null);

    if (studentIds.length === 0) {
      return NextResponse.json({ cohorts: [] });
    }

    // Get unique cohort IDs from these students
    const studentsWithCohorts = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        cohortId: { not: null },
      },
      select: {
        cohortId: true,
      },
      distinct: ['cohortId'],
    });

    const cohortIds = studentsWithCohorts
      .map((s) => s.cohortId)
      .filter((id): id is string => id !== null);

    if (cohortIds.length === 0) {
      return NextResponse.json({ cohorts: [] });
    }

    // Get cohorts with details
    const cohorts = await prisma.cohort.findMany({
      where: {
        id: { in: cohortIds },
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
        students: {
          where: {
            id: { in: studentIds },
          },
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true,
          },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // For each cohort, get the courses it's enrolled in (that the instructor teaches)
    const cohortsWithCourses = await Promise.all(
      cohorts.map(async (cohort) => {
        // Get all students in this cohort
        const cohortStudentIds = await prisma.student.findMany({
          where: { cohortId: cohort.id },
          select: { id: true },
        });

        const csIds = cohortStudentIds.map((s) => s.id);

        // Get courses these students are enrolled in (that instructor teaches)
        const enrolledCourses = await prisma.courseSubscription.findMany({
          where: {
            studentId: { in: csIds },
            courseId: { in: instructorCourseIds },
            status: 'active',
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                isActive: true,
              },
            },
          },
          distinct: ['courseId'],
        });

        return {
          ...cohort,
          enrolledCourses: enrolledCourses.map((ec) => ({
            id: ec.course.id,
            title: ec.course.title,
            description: ec.course.description,
            isActive: ec.course.isActive,
          })),
        };
      })
    );

    return NextResponse.json({ cohorts: cohortsWithCourses });
  } catch (error: any) {
    console.error('Error fetching instructor cohorts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohorts' },
      { status: 500 }
    );
  }
}
