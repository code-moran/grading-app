import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/lessons/[id]/quiz - Get quiz questions for a lesson (student access, without correct answers)
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

    const { id } = params;

    // Get lesson with quiz questions
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
        quizQuestions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Format quiz questions without revealing correct answers
    const formattedQuestions = lesson.quizQuestions.map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options as string[],
      explanation: question.explanation,
      order: question.order,
    }));

    return NextResponse.json(
      {
        lesson: {
          id: lesson.id,
          number: lesson.number,
          title: lesson.title,
          course: lesson.course,
        },
        questions: formattedQuestions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

