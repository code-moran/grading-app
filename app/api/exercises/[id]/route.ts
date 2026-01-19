import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/exercises/[id] - Get a specific exercise
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

    const exercise = await prisma.exercise.findUnique({
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

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({ exercise: formattedExercise }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Update an exercise
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
    const { title, description, maxPoints, rubricId } = body;

    // Check if exercise exists
    const existingExercise = await prisma.exercise.findUnique({
      where: { id: params.id },
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // If rubricId is provided, verify it exists
    if (rubricId) {
      const rubric = await prisma.rubric.findUnique({
        where: { id: rubricId },
      });

      if (!rubric) {
        return NextResponse.json(
          { error: 'Rubric not found' },
          { status: 404 }
        );
      }
    }

    // Update exercise
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (maxPoints !== undefined) updateData.maxPoints = maxPoints;
    if (rubricId !== undefined) updateData.rubricId = rubricId;

    const exercise = await prisma.exercise.update({
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

    return NextResponse.json({ exercise: formattedExercise }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Delete an exercise
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

    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Delete exercise (cascade will handle related records)
    await prisma.exercise.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Exercise deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}


