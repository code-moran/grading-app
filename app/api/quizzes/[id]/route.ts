import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/quizzes/[id] - Get a specific quiz question
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

    const quizQuestion = await prisma.quizQuestion.findUnique({
      where: { id: params.id },
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

    if (!quizQuestion) {
      return NextResponse.json(
        { error: 'Quiz question not found' },
        { status: 404 }
      );
    }

    // Get attempt stats
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        lessonId: quizQuestion.lessonId,
      },
    });

    let correctCount = 0;
    attempts.forEach((attempt) => {
      const questions = attempt.questions as any[];
      const q = questions.find((q: any) => q.questionId === quizQuestion.id);
      if (q && q.isCorrect) {
        correctCount++;
      }
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
        attemptCount: attempts.length,
        correctCount,
      },
      createdAt: quizQuestion.createdAt,
      updatedAt: quizQuestion.updatedAt,
    };

    return NextResponse.json({ question: formattedQuestion }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz question' },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update a quiz question
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
    if (!['instructor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Instructor or Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { question, options, correctAnswer, explanation, order } = body;

    // Check if quiz question exists
    const existingQuestion = await prisma.quizQuestion.findUnique({
      where: { id: params.id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Quiz question not found' },
        { status: 404 }
      );
    }

    // Validate options if provided
    if (options !== undefined) {
      if (!Array.isArray(options) || options.length < 2) {
        return NextResponse.json(
          { error: 'Options must be an array with at least 2 items' },
          { status: 400 }
        );
      }
    }

    // Validate correctAnswer if provided
    if (correctAnswer !== undefined) {
      const optionsToCheck = options || (existingQuestion.options as string[]);
      if (correctAnswer < 0 || correctAnswer >= optionsToCheck.length) {
        return NextResponse.json(
          { error: 'Correct answer index is out of bounds' },
          { status: 400 }
        );
      }
    }

    // Update quiz question
    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (options !== undefined) updateData.options = options as any;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (order !== undefined) updateData.order = order;

    const quizQuestion = await prisma.quizQuestion.update({
      where: { id: params.id },
      data: updateData,
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

    // Get attempt stats
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        lessonId: quizQuestion.lessonId,
      },
    });

    let correctCount = 0;
    attempts.forEach((attempt) => {
      const questions = attempt.questions as any[];
      const q = questions.find((q: any) => q.questionId === quizQuestion.id);
      if (q && q.isCorrect) {
        correctCount++;
      }
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
        attemptCount: attempts.length,
        correctCount,
      },
      createdAt: quizQuestion.createdAt,
      updatedAt: quizQuestion.updatedAt,
    };

    return NextResponse.json({ question: formattedQuestion }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz question' },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz question
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
    if (!['instructor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Instructor or Admin access required.' },
        { status: 403 }
      );
    }

    // Check if quiz question exists
    const quizQuestion = await prisma.quizQuestion.findUnique({
      where: { id: params.id },
    });

    if (!quizQuestion) {
      return NextResponse.json(
        { error: 'Quiz question not found' },
        { status: 404 }
      );
    }

    // Delete quiz question (cascade will handle related records)
    await prisma.quizQuestion.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Quiz question deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz question' },
      { status: 500 }
    );
  }
}


