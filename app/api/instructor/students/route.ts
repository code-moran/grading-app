import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/instructor/students - Get students enrolled in instructor's courses
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
                subscriptions: {
                  where: { status: 'active' },
                  include: {
                    user: {
                      include: {
                        studentProfile: {
                          include: {
                            cohort: {
                              select: {
                                id: true,
                                name: true,
                              },
                            },
                            _count: {
                              select: {
                                grades: true,
                                quizAttempts: true,
                                exerciseSubmissions: true,
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
                          },
                        },
                        _count: {
                          select: {
                            grades: true,
                            quizAttempts: true,
                            exerciseSubmissions: true,
                          },
                        },
                      },
                    },
                  },
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

    // Get optional course filter from query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Collect all unique students from instructor's courses
    const studentMap = new Map<string, any>();

    for (const courseInstructor of instructor.courses) {
      const course = courseInstructor.course;

      // Filter by course if specified
      if (courseId && course.id !== courseId) {
        continue;
      }

      for (const subscription of course.subscriptions) {
        // Handle subscriptions via user (with studentProfile)
        if (subscription.user?.studentProfile && subscription.user.role === 'student') {
          const user = subscription.user;
          const studentId = user.studentProfile!.id;

          if (!studentMap.has(studentId)) {
            // Get student's grades for this instructor's courses
            const studentCourses = instructor.courses.map((ci) => ci.course.id);
            const studentGrades = await prisma.grade.findMany({
              where: {
                studentId: studentId,
                lesson: {
                  courseId: {
                    in: studentCourses,
                  },
                },
              },
              include: {
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
                exercise: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: {
                gradedAt: 'desc',
              },
            });

            // Calculate average grade
            const totalPoints = studentGrades.reduce((sum, grade) => sum + grade.totalPoints, 0);
            const totalMaxPoints = studentGrades.reduce(
              (sum, grade) => sum + grade.maxPossiblePoints,
              0
            );
            const averageGrade =
              totalMaxPoints > 0 ? Math.round((totalPoints / totalMaxPoints) * 100) : 0;

            studentMap.set(studentId, {
              id: user.studentProfile!.id,
              userId: user.id,
              name: user.studentProfile!.name,
              email: user.studentProfile!.email || user.email,
              registrationNumber: user.studentProfile!.registrationNumber,
              cohortId: user.studentProfile!.cohortId || undefined,
              cohort: user.studentProfile!.cohort ? {
                id: user.studentProfile!.cohort.id,
                name: user.studentProfile!.cohort.name,
              } : undefined,
              courses: [
                {
                  id: course.id,
                  title: course.title,
                  subscribedAt: subscription.subscribedAt,
                },
              ],
              stats: {
                totalGrades: user.studentProfile!._count.grades,
                totalQuizAttempts: user.studentProfile!._count.quizAttempts,
                totalSubmissions: user.studentProfile!._count.exerciseSubmissions,
                averageGrade,
              },
              recentGrades: studentGrades.slice(0, 5),
            });
          } else {
            // Add course to existing student
            const existingStudent = studentMap.get(studentId);
            existingStudent.courses.push({
              id: course.id,
              title: course.title,
              subscribedAt: subscription.subscribedAt,
            });
          }
        }
        // Handle subscriptions directly via student (without User account)
        else if (subscription.student) {
          const student = subscription.student;
          const studentId = student.id;

          if (!studentMap.has(studentId)) {
            // Get student's grades for this instructor's courses
            const studentCourses = instructor.courses.map((ci) => ci.course.id);
            const studentGrades = await prisma.grade.findMany({
              where: {
                studentId: studentId,
                lesson: {
                  courseId: {
                    in: studentCourses,
                  },
                },
              },
              include: {
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
                exercise: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: {
                gradedAt: 'desc',
              },
            });

            // Calculate average grade
            const totalPoints = studentGrades.reduce((sum, grade) => sum + grade.totalPoints, 0);
            const totalMaxPoints = studentGrades.reduce(
              (sum, grade) => sum + grade.maxPossiblePoints,
              0
            );
            const averageGrade =
              totalMaxPoints > 0 ? Math.round((totalPoints / totalMaxPoints) * 100) : 0;

            studentMap.set(studentId, {
              id: student.id,
              userId: undefined,
              name: student.name,
              email: student.email || '',
              registrationNumber: student.registrationNumber,
              cohortId: student.cohortId || undefined,
              cohort: student.cohort ? {
                id: student.cohort.id,
                name: student.cohort.name,
              } : undefined,
              courses: [
                {
                  id: course.id,
                  title: course.title,
                  subscribedAt: subscription.subscribedAt,
                },
              ],
              stats: {
                totalGrades: student._count.grades,
                totalQuizAttempts: student._count.quizAttempts,
                totalSubmissions: student._count.exerciseSubmissions,
                averageGrade,
              },
              recentGrades: studentGrades.slice(0, 5),
            });
          } else {
            // Add course to existing student
            const existingStudent = studentMap.get(studentId);
            existingStudent.courses.push({
              id: course.id,
              title: course.title,
              subscribedAt: subscription.subscribedAt,
            });
          }
        }
      }
    }

    const students = Array.from(studentMap.values());

    // Sort by name
    students.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ students }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching instructor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

