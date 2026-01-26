import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering since we use getServerSession (which uses headers)
export const dynamic = 'force-dynamic';

// GET /api/rubrics - Get all rubrics
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

    const rubrics = await prisma.rubric.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedRubrics = rubrics.map((rubric) => ({
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
    }));

    return NextResponse.json({ rubrics: formattedRubrics }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching rubrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rubrics' },
      { status: 500 }
    );
  }
}


