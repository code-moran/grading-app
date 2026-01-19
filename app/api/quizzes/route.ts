import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/quizzes - Get all quiz questions (with optional lesson filter)
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
    if (!['instructor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Instructor or Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    const where: any = {};
    if (lessonId) {
      where.lessonId = lessonId;
    }

    const quizQuestions = await prisma.quizQuestion.findMany({
      where,
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
        _count: {
          select: {
            lesson: true, // This will be 1, but we can use it to verify existence
          },
        },
      },
      orderBy: [
        { lessonId: 'asc' },
        { order: 'asc' },
      ],
    });

    // Get attempt counts for each question (we'll need to query QuizAttempt for this)
    const formattedQuestions = await Promise.all(
      quizQuestions.map(async (question) => {
        // Count attempts that include this question
        const attempts = await prisma.quizAttempt.findMany({
          where: {
            lessonId: question.lessonId,
          },
        });

        // Count how many attempts got this question correct
        let correctCount = 0;
        attempts.forEach((attempt) => {
          const questions = attempt.questions as any[];
          const q = questions.find((q: any) => q.questionId === question.id);
          if (q && q.isCorrect) {
            correctCount++;
          }
        });

        return {
          id: question.id,
          lessonId: question.lessonId,
          lesson: question.lesson,
          question: question.question,
          options: question.options as string[],
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          order: question.order,
          stats: {
            attemptCount: attempts.length,
            correctCount,
          },
          createdAt: question.createdAt,
          updatedAt: question.updatedAt,
        };
      })
    );

    return NextResponse.json({ questions: formattedQuestions }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create a new quiz question
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
    if (!['instructor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Instructor or Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { lessonId, question, options, correctAnswer, explanation, order } = body;

    // Validate required fields
    if (!lessonId || !question || !options || correctAnswer === undefined) {
      return NextResponse.json(
        { error: 'Lesson ID, question, options, and correct answer are required' },
        { status: 400 }
      );
    }

    // Validate options array
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Options must be an array with at least 2 items' },
        { status: 400 }
      );
    }

    // Validate correctAnswer is within bounds
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return NextResponse.json(
        { error: 'Correct answer index is out of bounds' },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Get the highest order for this lesson to set default order
    const lastQuestion = await prisma.quizQuestion.findFirst({
      where: { lessonId },
      orderBy: { order: 'desc' },
    });

    const questionOrder = order !== undefined ? order : (lastQuestion?.order ?? -1) + 1;

    // Create quiz question
    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        lessonId,
        question,
        options: options as any,
        correctAnswer,
        explanation: explanation || null,
        order: questionOrder,
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
      },
    });

    const formattedQuestion = {
      id: quizQuestion.id,
      lessonId: quizQuestion.lessonId,
      lesson: quizQuestion.lesson,
      question: quizQuestion.question,
      options: quizQuestion.options as string[],
      correctAnswer: quizQuestion.correctAnswer,
      explanation: quizQuestion.explanation,
      order: quizQuestion.order,
      stats: {
        attemptCount: 0,
        correctCount: 0,
      },
      createdAt: quizQuestion.createdAt,
      updatedAt: quizQuestion.updatedAt,
    };

    return NextResponse.json({ question: formattedQuestion }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz question' },
      { status: 500 }
    );
  }
}


