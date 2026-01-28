import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/rubrics/[id] - Get a specific rubric
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

    const rubric = await prisma.rubric.findUnique({
      where: { id: params.id },
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
        _count: {
          select: {
            exercises: true,
          },
        },
      },
    });

    if (!rubric) {
      return NextResponse.json(
        { error: 'Rubric not found' },
        { status: 404 }
      );
    }

    const formattedRubric = {
      id: rubric.id,
      name: rubric.name,
      description: rubric.description,
      totalPoints: rubric.totalPoints,
      criteria: rubric.criteriaMappings.map((m) => ({
        id: m.criteria.id,
        name: m.criteria.name,
        description: m.criteria.description,
        weight: m.criteria.weight,
      })),
      levels: rubric.levelMappings.map((m) => ({
        id: m.level.id,
        name: m.level.name,
        description: m.level.description,
        points: m.level.points,
        color: m.level.color,
      })),
      exerciseCount: rubric._count.exercises,
      createdAt: rubric.createdAt,
      updatedAt: rubric.updatedAt,
    };

    return NextResponse.json({ rubric: formattedRubric }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching rubric:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rubric' },
      { status: 500 }
    );
  }
}

// PATCH /api/rubrics/[id] - Update a rubric
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
    const { name, description, totalPoints, criteriaIds, levelIds, criteriaWeights } = body;

    // Check if rubric exists
    const existingRubric = await prisma.rubric.findUnique({
      where: { id: params.id },
    });

    if (!existingRubric) {
      return NextResponse.json(
        { error: 'Rubric not found' },
        { status: 404 }
      );
    }

    // Use a transaction to update the rubric and its mappings
    const updatedRubric = await prisma.$transaction(async (tx) => {
      // Update rubric basic info
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (totalPoints !== undefined) updateData.totalPoints = totalPoints;

      const rubric = await tx.rubric.update({
        where: { id: params.id },
        data: updateData,
      });

      // Update criteria mappings if provided
      if (criteriaIds !== undefined && Array.isArray(criteriaIds)) {
        // Delete existing mappings
        await tx.rubricCriteriaMapping.deleteMany({
          where: { rubricId: params.id },
        });

        // Create new mappings
        if (criteriaIds.length > 0) {
          // Verify all criteria exist
          const existingCriteria = await tx.rubricCriteria.findMany({
            where: { id: { in: criteriaIds } },
          });

          if (existingCriteria.length !== criteriaIds.length) {
            throw new Error('One or more criteria not found');
          }

          // Update criteria weights if provided
          if (criteriaWeights && typeof criteriaWeights === 'object') {
            for (const [criteriaId, weight] of Object.entries(criteriaWeights)) {
              const weightValue = typeof weight === 'number' ? weight : parseInt(weight as string, 10);
              if (!isNaN(weightValue) && weightValue >= 0 && weightValue <= 100) {
                await tx.rubricCriteria.update({
                  where: { id: criteriaId },
                  data: { weight: weightValue },
                });
              }
            }
          }

          // Create mappings
          await tx.rubricCriteriaMapping.createMany({
            data: criteriaIds.map((criteriaId: string) => ({
              rubricId: params.id,
              criteriaId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Update level mappings if provided
      if (levelIds !== undefined && Array.isArray(levelIds)) {
        // Delete existing mappings
        await tx.rubricLevelMapping.deleteMany({
          where: { rubricId: params.id },
        });

        // Create new mappings
        if (levelIds.length > 0) {
          // Verify all levels exist
          const existingLevels = await tx.rubricLevel.findMany({
            where: { id: { in: levelIds } },
          });

          if (existingLevels.length !== levelIds.length) {
            throw new Error('One or more levels not found');
          }

          // Create mappings
          await tx.rubricLevelMapping.createMany({
            data: levelIds.map((levelId: string) => ({
              rubricId: params.id,
              levelId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Fetch updated rubric with relations
      return await tx.rubric.findUnique({
        where: { id: params.id },
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
          _count: {
            select: {
              exercises: true,
            },
          },
        },
      });
    });

    const formattedRubric = {
      id: updatedRubric!.id,
      name: updatedRubric!.name,
      description: updatedRubric!.description,
      totalPoints: updatedRubric!.totalPoints,
      criteria: updatedRubric!.criteriaMappings.map((m) => ({
        id: m.criteria.id,
        name: m.criteria.name,
        description: m.criteria.description,
        weight: m.criteria.weight,
      })),
      levels: updatedRubric!.levelMappings.map((m) => ({
        id: m.level.id,
        name: m.level.name,
        description: m.level.description,
        points: m.level.points,
        color: m.level.color,
      })),
      exerciseCount: updatedRubric!._count.exercises,
      createdAt: updatedRubric!.createdAt,
      updatedAt: updatedRubric!.updatedAt,
    };

    return NextResponse.json({ rubric: formattedRubric }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating rubric:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update rubric' },
      { status: 500 }
    );
  }
}
