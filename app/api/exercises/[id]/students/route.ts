import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/exercises/[id]/students - Get students enrolled in the course with their submissions and grades for this exercise
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
    if (!['instructor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Instructor or Admin access required.' },
        { status: 403 }
      );
    }

    // Get the exercise with lesson and course info
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: {
        lesson: {
          include: {
            course: {
              include: {
                subscriptions: {
                  include: {
                    user: {
                      include: {
                        studentProfile: {
                          include: {
                            cohort: true,
                          },
                        },
                      },
                    },
                    student: {
                      include: {
                        cohort: true,
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

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    const courseId = exercise.lesson.course.id;

    // Get all students enrolled in this course (via user or direct student enrollment)
    const enrolledStudents: any[] = [];

    for (const subscription of exercise.lesson.course.subscriptions) {
      let student: any = null;

      // Handle subscription via user (with studentProfile)
      if (subscription.user?.studentProfile) {
        student = subscription.user.studentProfile;
      }
      // Handle subscription via direct student enrollment
      else if (subscription.student) {
        student = subscription.student;
      }

      if (student) {
        enrolledStudents.push({
          id: student.id,
          name: student.name,
          email: student.email,
          registrationNumber: student.registrationNumber,
          cohortId: student.cohortId,
          cohort: student.cohort
            ? {
                id: student.cohort.id,
                name: student.cohort.name,
              }
            : null,
        });
      }
    }

    // Remove duplicates (in case a student is enrolled both ways)
    const uniqueStudents = Array.from(
      new Map(enrolledStudents.map((s) => [s.id, s])).values()
    );

    // Get submissions and grades for each student
    const studentsWithData = await Promise.all(
      uniqueStudents.map(async (student) => {
        // Get submission for this exercise
        const submission = await prisma.exerciseSubmission.findFirst({
          where: {
            studentId: student.id,
            exerciseId: params.id,
          },
          orderBy: {
            submittedAt: 'desc',
          },
        });

        // Get existing grade for this exercise
        const grade = await prisma.grade.findUnique({
          where: {
            studentId_exerciseId: {
              studentId: student.id,
              exerciseId: params.id,
            },
          },
          include: {
            gradeCriteria: {
              include: {
                criteria: true,
                level: true,
              },
            },
          },
        });

        return {
          ...student,
          submission: submission
            ? {
                id: submission.id,
                githubUrl: submission.githubUrl,
                codingStandards: submission.codingStandards,
                status: submission.status,
                submittedAt: submission.submittedAt,
              }
            : null,
          grade: grade
            ? {
                id: grade.id,
                totalPoints: grade.totalPoints,
                maxPossiblePoints: grade.maxPossiblePoints,
                percentage: grade.percentage,
                letterGrade: grade.letterGrade,
                feedback: grade.feedback,
                gradedBy: grade.gradedBy,
                gradedAt: grade.gradedAt,
                criteriaGrades: grade.gradeCriteria.map((gc) => ({
                  criteriaId: gc.criteriaId,
                  levelId: gc.levelId,
                  points: gc.points,
                  comments: gc.comments,
                  criteria: {
                    id: gc.criteria.id,
                    name: gc.criteria.name,
                  },
                  level: {
                    id: gc.level.id,
                    name: gc.level.name,
                    points: gc.level.points,
                  },
                })),
              }
            : null,
        };
      })
    );

    return NextResponse.json(
      { students: studentsWithData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching students for exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

