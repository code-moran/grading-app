import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, lessonId } = body;

    // Create a test quiz attempt
    const testAttempt = await prisma.quizAttempt.create({
      data: {
        studentId: studentId || 'cmfsdqbww00019xeztpecx5fy',
        lessonId: lessonId || 'lesson-01',
        questions: [
          {
            questionId: 'q1',
            selectedAnswer: 0,
            correctAnswer: 0,
            isCorrect: true
          }
        ],
        score: 100,
        passed: true,
        timeSpent: 300,
      },
    });

    return NextResponse.json({ 
      message: 'Test quiz attempt created successfully',
      attempt: testAttempt 
    });
  } catch (error) {
    console.error('Error creating test quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to create test quiz attempt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      orderBy: { completedAt: 'desc' },
    });

    return NextResponse.json({ 
      message: 'Quiz attempts retrieved successfully',
      attempts: attempts 
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
