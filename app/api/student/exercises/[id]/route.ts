import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/student/exercises/[id] - Get exercise details for students
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
    if (userRole !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden. Student access required.' },
        { status: 403 }
      );
    }

    // Get student profile
    let student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

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

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: {
        lesson: {
          select: {
            id: true,
            number: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        rubric: {
          include: {
            criteriaMappings: {
              include: {
                criteria: true,
              },
            },
            levelMappings: {
              include: {
                level: true,
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

    // Get student's submission
    const submission = await prisma.exerciseSubmission.findFirst({
      where: {
        studentId: student.id,
        exerciseId: params.id,
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Get student's grade
    const grade = await prisma.grade.findFirst({
      where: {
        studentId: student.id,
        exerciseId: params.id,
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

    const formattedExercise = {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      maxPoints: exercise.maxPoints,
      lessonId: exercise.lessonId,
      lesson: exercise.lesson,
      rubric: {
        id: exercise.rubric.id,
        name: exercise.rubric.name,
        description: exercise.rubric.description,
        totalPoints: exercise.rubric.totalPoints,
        criteria: exercise.rubric.criteriaMappings.map((m) => ({
          id: m.criteria.id,
          name: m.criteria.name,
          description: m.criteria.description,
          weight: m.criteria.weight,
        })),
        levels: exercise.rubric.levelMappings.map((m) => ({
          id: m.level.id,
          name: m.level.name,
          description: m.level.description,
          points: m.level.points,
          color: m.level.color,
        })),
      },
      submission: submission
        ? {
            id: submission.id,
            githubUrl: submission.githubUrl,
            codingStandards: submission.codingStandards as any,
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
            gradedAt: grade.gradedAt,
            criteria: grade.gradeCriteria.map((gc) => ({
              criteriaId: gc.criteriaId,
              criteriaName: gc.criteria.name,
              levelId: gc.levelId,
              levelName: gc.level.name,
              points: gc.level.points,
            })),
          }
        : null,
    };

    return NextResponse.json({ exercise: formattedExercise }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}

