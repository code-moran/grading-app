import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/lessons/[id] - Get lesson details with exercises, quiz questions, and stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
        },
        exercises: {
          include: {
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
            _count: {
              select: {
                grades: true,
                exerciseSubmissions: true,
              },
            },
          },
          orderBy: { title: 'asc' },
        },
        quizQuestions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            exercises: true,
            quizQuestions: true,
            quizAttempts: true,
            grades: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedLesson = {
      id: lesson.id,
      number: lesson.number,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      courseId: lesson.courseId,
      course: lesson.course,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      exercises: lesson.exercises.map((exercise) => ({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        maxPoints: exercise.maxPoints,
        rubric: {
          id: exercise.rubric.id,
          name: exercise.rubric.name,
          description: exercise.rubric.description,
          totalPoints: exercise.rubric.totalPoints,
          criteria: exercise.rubric.criteriaMappings.map((mapping) => ({
            id: mapping.criteria.id,
            name: mapping.criteria.name,
            description: mapping.criteria.description,
            weight: mapping.criteria.weight,
          })),
          levels: exercise.rubric.levelMappings.map((mapping) => ({
            id: mapping.level.id,
            name: mapping.level.name,
            description: mapping.level.description,
            points: mapping.level.points,
            color: mapping.level.color,
          })),
        },
        submissionCount: exercise._count.exerciseSubmissions,
        gradeCount: exercise._count.grades,
      })),
      quizQuestions: lesson.quizQuestions.map((question) => ({
        id: question.id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        order: question.order,
      })),
      stats: {
        exerciseCount: lesson._count.exercises,
        quizQuestionCount: lesson._count.quizQuestions,
        quizAttemptCount: lesson._count.quizAttempts,
        gradeCount: lesson._count.grades,
      },
    };

    return NextResponse.json({ lesson: formattedLesson }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

