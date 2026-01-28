import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/instructor/cohorts/[cohortId] - Get detailed cohort information for instructor
export async function GET(
  request: NextRequest,
  { params }: { params: { cohortId: string } }
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

    const cohortId = params.cohortId;

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        courses: {
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
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    const instructorCourseIds = instructor.courses.map((ci) => ci.course.id);

    // Get cohort information
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
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

    // Get all students in this cohort
    const cohortStudentIds = cohort.students.map((s) => s.id);

    // Get courses these students are enrolled in (that instructor teaches)
    const enrolledCourses = await prisma.courseSubscription.findMany({
      where: {
        studentId: { in: cohortStudentIds },
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
        // Get grades for this student in instructor's courses
        const grades = await prisma.grade.findMany({
          where: {
            studentId: student.id,
            exercise: {
              lesson: {
                courseId: { in: instructorCourseIds },
              },
            },
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

        // Calculate average grade
        const avgGrade =
          grades.length > 0
            ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
            : null;

        // Get enrolled courses count
        const enrolledCoursesCount = await prisma.courseSubscription.count({
          where: {
            studentId: student.id,
            courseId: { in: instructorCourseIds },
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
    const enrolledStudentsCount = enrolledCourses.reduce((acc, ec) => {
      const studentsInCourse = cohort.students.filter((s) =>
        cohortStudentIds.includes(s.id)
      ).length;
      return acc + studentsInCourse;
    }, 0);

    const allGrades = await prisma.grade.findMany({
      where: {
        studentId: { in: cohortStudentIds },
        exercise: {
          lesson: {
            courseId: { in: instructorCourseIds },
          },
        },
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
        enrolledStudentsCount,
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
  } catch (error: any) {
    console.error('Error fetching cohort details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort details' },
      { status: 500 }
    );
  }
}
