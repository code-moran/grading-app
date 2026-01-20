import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/rubrics/criteria/[id] - Get a specific criterion
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

    const criterion = await prisma.rubricCriteria.findUnique({
      where: { id: params.id },
    });

    if (!criterion) {
      return NextResponse.json(
        { error: 'Criterion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        criterion: {
          id: criterion.id,
          name: criterion.name,
          description: criterion.description,
          weight: criterion.weight,
          createdAt: criterion.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching criterion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch criterion' },
      { status: 500 }
    );
  }
}

// PATCH /api/rubrics/criteria/[id] - Update a criterion
export async function PATCH(
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
    const { name, description, weight } = body;

    // Check if criterion exists
    const existingCriterion = await prisma.rubricCriteria.findUnique({
      where: { id: params.id },
    });

    if (!existingCriterion) {
      return NextResponse.json(
        { error: 'Criterion not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: 'Criterion name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (weight !== undefined) {
      const weightValue = parseInt(weight);
      if (isNaN(weightValue) || weightValue < 0 || weightValue > 100) {
        return NextResponse.json(
          { error: 'Weight must be between 0 and 100' },
          { status: 400 }
        );
      }
      updateData.weight = weightValue;
    }

    const criterion = await prisma.rubricCriteria.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        criterion: {
          id: criterion.id,
          name: criterion.name,
          description: criterion.description,
          weight: criterion.weight,
          createdAt: criterion.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating criterion:', error);
    return NextResponse.json(
      { error: 'Failed to update criterion' },
      { status: 500 }
    );
  }
}

// DELETE /api/rubrics/criteria/[id] - Delete a criterion
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

    // Check if criterion exists
    const criterion = await prisma.rubricCriteria.findUnique({
      where: { id: params.id },
      include: {
        rubricMappings: {
          include: {
            rubric: {
              include: {
                _count: {
                  select: { exercises: true },
                },
              },
            },
          },
        },
      },
    });

    if (!criterion) {
      return NextResponse.json(
        { error: 'Criterion not found' },
        { status: 404 }
      );
    }

    // Check if criterion is used in any rubrics that have exercises
    const usedInExercises = criterion.rubricMappings.some(
      (mapping) => mapping.rubric._count.exercises > 0
    );

    if (usedInExercises) {
      return NextResponse.json(
        {
          error:
            'Cannot delete criterion that is used in rubrics with exercises',
        },
        { status: 400 }
      );
    }

    // Delete the criterion (mappings will be cascade deleted)
    await prisma.rubricCriteria.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Criterion deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting criterion:', error);
    return NextResponse.json(
      { error: 'Failed to delete criterion' },
      { status: 500 }
    );
  }
}
