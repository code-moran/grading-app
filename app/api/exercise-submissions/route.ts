import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExerciseSubmission } from '@/lib/types';

// GET /api/exercise-submissions - Get exercise submissions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const exerciseId = searchParams.get('exerciseId');

    const whereClause: any = {};
    
    if (studentId) {
      whereClause.studentId = studentId;
    }
    
    if (exerciseId) {
      whereClause.exerciseId = exerciseId;
    }

    const submissions = await prisma.exerciseSubmission.findMany({
      where: whereClause,
      include: {
        exercise: {
          select: {
            lessonId: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formattedSubmissions: (ExerciseSubmission & { lessonId?: string })[] = submissions.map(submission => ({
      id: submission.id,
      studentId: submission.studentId,
      exerciseId: submission.exerciseId,
      githubUrl: submission.githubUrl,
      codingStandards: submission.codingStandards as any,
      submittedAt: submission.submittedAt,
      status: submission.status as any,
      lessonId: submission.exercise.lessonId,
    }));

    return NextResponse.json({ submissions: formattedSubmissions });
  } catch (error) {
    console.error('Error fetching exercise submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise submissions' },
      { status: 500 }
    );
  }
}

// POST /api/exercise-submissions - Create a new exercise submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      exerciseId,
      githubUrl,
      codingStandards,
      status
    } = body;

    // Validate required fields
    if (!studentId || !exerciseId || !githubUrl || !codingStandards) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newSubmission = await prisma.exerciseSubmission.create({
      data: {
        studentId,
        exerciseId,
        githubUrl,
        codingStandards: codingStandards as any,
        status: status || 'pending',
      },
    });

    const formattedSubmission: ExerciseSubmission = {
      id: newSubmission.id,
      studentId: newSubmission.studentId,
      exerciseId: newSubmission.exerciseId,
      githubUrl: newSubmission.githubUrl,
      codingStandards: newSubmission.codingStandards as any,
      submittedAt: newSubmission.submittedAt,
      status: newSubmission.status as any
    };

    return NextResponse.json({ submission: formattedSubmission }, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise submission:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise submission' },
      { status: 500 }
    );
  }
}
