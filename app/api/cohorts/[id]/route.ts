import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/cohorts/[id] - Get a specific cohort (detailed for admin, basic for others)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    const userRole = session?.user ? (session.user as any).role : null;

    // For admin users, return detailed cohort information
    if (userRole === 'admin') {
      const cohort = await prisma.cohort.findUnique({
        where: { id },
        include: {
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              registrationNumber: true,
              createdAt: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
      });

      if (!cohort) {
        return NextResponse.json(
          { error: 'Cohort not found' },
          { status: 404 }
        );
      }

      // Get all courses students in this cohort are enrolled in
      const cohortStudentIds = cohort.students.map((s) => s.id);

      const enrolledCourses = await prisma.courseSubscription.findMany({
        where: {
          studentId: { in: cohortStudentIds },
          status: 'active',
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              isActive: true,
              _count: {
                select: {
                  lessons: true,
                  subscriptions: true,
                },
              },
            },
          },
        },
        distinct: ['courseId'],
      });

      // Get student statistics
      const studentStats = await Promise.all(
        cohort.students.map(async (student) => {
          const grades = await prisma.grade.findMany({
            where: {
              studentId: student.id,
            },
            select: {
              id: true,
              percentage: true,
              exercise: {
                select: {
                  id: true,
                  title: true,
                  lesson: {
                    select: {
                      id: true,
                      number: true,
                      title: true,
                      course: {
                        select: {
                          id: true,
                          title: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          });

          const avgGrade =
            grades.length > 0
              ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
              : null;

          const enrolledCoursesCount = await prisma.courseSubscription.count({
            where: {
              studentId: student.id,
              status: 'active',
            },
          });

          return {
            ...student,
            averageGrade: avgGrade,
            enrolledCoursesCount,
            recentGrades: grades.map((g) => ({
              id: g.id,
              percentage: g.percentage,
              exercise: {
                id: g.exercise.id,
                title: g.exercise.title,
                lesson: {
                  id: g.exercise.lesson.id,
                  number: g.exercise.lesson.number,
                  title: g.exercise.lesson.title,
                  course: {
                    id: g.exercise.lesson.course.id,
                    title: g.exercise.lesson.course.title,
                  },
                },
              },
            })),
          };
        })
      );

      // Calculate overall statistics
      const totalStudents = cohort.students.length;
      const allGrades = await prisma.grade.findMany({
        where: {
          studentId: { in: cohortStudentIds },
        },
        select: {
          percentage: true,
        },
      });

      const averageGrade =
        allGrades.length > 0
          ? allGrades.reduce((sum, g) => sum + g.percentage, 0) / allGrades.length
          : null;

      return NextResponse.json({
        cohort: {
          id: cohort.id,
          name: cohort.name,
          description: cohort.description,
          startDate: cohort.startDate,
          endDate: cohort.endDate,
          isActive: cohort.isActive,
          createdAt: cohort.createdAt,
          updatedAt: cohort.updatedAt,
        },
        statistics: {
          totalStudents,
          enrolledStudentsCount: enrolledCourses.length,
          enrolledCoursesCount: enrolledCourses.length,
          averageGrade,
          totalGrades: allGrades.length,
        },
        enrolledCourses: enrolledCourses.map((ec) => ({
          id: ec.course.id,
          title: ec.course.title,
          description: ec.course.description,
          isActive: ec.course.isActive,
          lessonCount: ec.course._count.lessons,
          subscriberCount: ec.course._count.subscriptions,
        })),
        students: studentStats,
      });
    }

    // For non-admin users, return basic cohort information
    const cohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            email: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ cohort });
  } catch (error: any) {
    console.error('Error fetching cohort:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort' },
      { status: 500 }
    );
  }
}

// PUT /api/cohorts/[id] - Update a specific cohort
export async function PUT(
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
    if (userRole !== 'admin' && userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, startDate, endDate, isActive } = body;

    // Check if cohort exists
    const existingCohort = await prisma.cohort.findUnique({
      where: { id },
    });

    if (!existingCohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Check if name is being changed and if it already exists
    if (name && name.trim() !== existingCohort.name) {
      const duplicateCheck = await prisma.cohort.findUnique({
        where: { name: name.trim() },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Cohort with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update cohort
    const updatedCohort = await prisma.cohort.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description || null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return NextResponse.json({ cohort: updatedCohort });
  } catch (error: any) {
    console.error('Error updating cohort:', error);
    return NextResponse.json(
      { error: 'Failed to update cohort' },
      { status: 500 }
    );
  }
}

// DELETE /api/cohorts/[id] - Delete a specific cohort
export async function DELETE(
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
    if (userRole !== 'admin' && userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if cohort exists
    const existingCohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!existingCohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Check if cohort has students
    if (existingCohort._count.students > 0) {
      return NextResponse.json(
        { error: 'Cannot delete cohort with assigned students. Please remove students first or set cohort to inactive.' },
        { status: 400 }
      );
    }

    // Delete cohort
    await prisma.cohort.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cohort deleted successfully' });
  } catch (error) {
    console.error('Error deleting cohort:', error);
    return NextResponse.json(
      { error: 'Failed to delete cohort' },
      { status: 500 }
    );
  }
}

