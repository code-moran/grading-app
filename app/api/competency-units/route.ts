import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/competency-units - Get all competency units
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unitStandardId = searchParams.get('unitStandardId');
    const isActive = searchParams.get('isActive');

    const whereClause: any = {};
    if (unitStandardId) {
      whereClause.unitStandardId = unitStandardId;
    }
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const competencyUnits = await prisma.competencyUnit.findMany({
      where: whereClause,
      include: {
        unitStandard: {
          select: {
            id: true,
            code: true,
            title: true,
            knqfLevel: true,
          },
        },
        _count: {
          select: {
            exercises: true,
          },
        },
      },
      orderBy: [
        { unitStandard: { code: 'asc' } },
        { code: 'asc' },
      ],
    });

    return NextResponse.json({ competencyUnits });
  } catch (error: any) {
    console.error('Error fetching competency units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competency units', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/competency-units - Create a new competency unit (Admin only)
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
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { unitStandardId, code, title, description, performanceCriteria, isActive } = body;

    // Validate required fields
    if (!unitStandardId || !code || !title) {
      return NextResponse.json(
        { error: 'Unit standard ID, code, and title are required' },
        { status: 400 }
      );
    }

    // Check if competency unit code already exists for this unit standard
    const existing = await prisma.competencyUnit.findUnique({
      where: {
        unitStandardId_code: {
          unitStandardId,
          code: code.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Competency unit with this code already exists for this unit standard' },
        { status: 409 }
      );
    }

    // Create new competency unit
    const competencyUnit = await prisma.competencyUnit.create({
      data: {
        unitStandardId,
        code: code.trim(),
        title: title.trim(),
        description: description || null,
        performanceCriteria: performanceCriteria || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        unitStandard: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ competencyUnit }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating competency unit:', error);
    return NextResponse.json(
      { error: 'Failed to create competency unit', details: error.message },
      { status: 500 }
    );
  }
}
