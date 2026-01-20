import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/unit-standards - Get all unit standards
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
    const knqfLevel = searchParams.get('knqfLevel');
    const isActive = searchParams.get('isActive');

    const whereClause: any = {};
    if (knqfLevel) {
      whereClause.knqfLevel = parseInt(knqfLevel);
    }
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const unitStandards = await prisma.unitStandard.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            competencyUnits: true,
            courses: true,
          },
        },
      },
      orderBy: [
        { knqfLevel: 'asc' },
        { code: 'asc' },
      ],
    });

    return NextResponse.json({ unitStandards });
  } catch (error: any) {
    console.error('Error fetching unit standards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unit standards', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/unit-standards - Create a new unit standard (Admin only)
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
    const { code, title, description, knqfLevel, version, isActive } = body;

    // Validate required fields
    if (!code || !title || !knqfLevel) {
      return NextResponse.json(
        { error: 'Code, title, and KNQF level are required' },
        { status: 400 }
      );
    }

    // Check if unit standard code already exists
    const existing = await prisma.unitStandard.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Unit standard with this code already exists' },
        { status: 409 }
      );
    }

    // Create new unit standard
    const unitStandard = await prisma.unitStandard.create({
      data: {
        code: code.trim(),
        title: title.trim(),
        description: description || null,
        knqfLevel: parseInt(knqfLevel),
        version: version || '1.0',
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ unitStandard }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating unit standard:', error);
    return NextResponse.json(
      { error: 'Failed to create unit standard', details: error.message },
      { status: 500 }
    );
  }
}
