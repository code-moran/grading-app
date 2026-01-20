import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/rubrics/criteria - Get all criteria
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

    const criteria = await prisma.rubricCriteria.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      {
        criteria: criteria.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          weight: c.weight,
          createdAt: c.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching criteria:', error);
    return NextResponse.json(
      { error: 'Failed to fetch criteria' },
      { status: 500 }
    );
  }
}

// POST /api/rubrics/criteria - Create a new criterion
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
    const { name, description, weight } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Criterion name is required' },
        { status: 400 }
      );
    }

    const weightValue = weight !== undefined ? parseInt(weight) : 25;
    if (weightValue < 0 || weightValue > 100) {
      return NextResponse.json(
        { error: 'Weight must be between 0 and 100' },
        { status: 400 }
      );
    }

    const criterion = await prisma.rubricCriteria.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        weight: weightValue,
      },
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
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating criterion:', error);
    return NextResponse.json(
      { error: 'Failed to create criterion' },
      { status: 500 }
    );
  }
}
