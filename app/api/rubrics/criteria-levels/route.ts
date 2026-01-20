import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/rubrics/criteria-levels - Get all available criteria and levels
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

    // Fetch all criteria and levels
    const [criteria, levels] = await Promise.all([
      prisma.rubricCriteria.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.rubricLevel.findMany({
        orderBy: { points: 'desc' },
      }),
    ]);

    return NextResponse.json(
      {
        criteria: criteria.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          weight: c.weight,
        })),
        levels: levels.map((l) => ({
          id: l.id,
          name: l.name,
          description: l.description,
          points: l.points,
          color: l.color,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching criteria and levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch criteria and levels' },
      { status: 500 }
    );
  }
}
