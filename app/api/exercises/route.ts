import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/exercises - Get all exercises (with optional lesson filter)
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

    const exercises = await prisma.exercise.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedExercises = exercises.map((exercise) => ({
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
      stats: {
        gradeCount: exercise._count.grades,
        submissionCount: exercise._count.exerciseSubmissions,
      },
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    }));

    return NextResponse.json({ exercises: formattedExercises }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Create a new exercise
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
    const { lessonId, title, description, maxPoints, rubricId } = body;

    // Validate required fields
    if (!lessonId || !title || !rubricId) {
      return NextResponse.json(
        { error: 'Lesson ID, title, and rubric ID are required' },
        { status: 400 }
      );
    }

    // Check if lesson exists and is linked to a valid course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            isActive: true,
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

    // Ensure lesson is linked to a valid course
    if (!lesson.course) {
      return NextResponse.json(
        { error: 'Lesson is not linked to a valid course. Please assign the lesson to a course first.' },
        { status: 400 }
      );
    }

    // Check if rubric exists
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
    });

    if (!rubric) {
      return NextResponse.json(
        { error: 'Rubric not found' },
        { status: 404 }
      );
    }

    // Create exercise
    const exercise = await prisma.exercise.create({
      data: {
        lessonId,
        title,
        description: description || null,
        maxPoints: maxPoints || 16,
        rubricId,
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
      stats: {
        gradeCount: exercise._count.grades,
        submissionCount: exercise._count.exerciseSubmissions,
      },
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };

    return NextResponse.json({ exercise: formattedExercise }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}


