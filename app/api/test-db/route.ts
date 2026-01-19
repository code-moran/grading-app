import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const studentCount = await prisma.student.count();
    const lessonCount = await prisma.lesson.count();
    const quizAttemptCount = await prisma.quizAttempt.count();
    
    return NextResponse.json({
      message: 'Database connection successful',
      counts: {
        students: studentCount,
        lessons: lessonCount,
        quizAttempts: quizAttemptCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
