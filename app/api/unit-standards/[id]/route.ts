import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/unit-standards/[id] - Get a specific unit standard
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

    const unitStandard = await prisma.unitStandard.findUnique({
      where: { id: params.id },
      include: {
        competencyUnits: {
          where: { isActive: true },
          orderBy: { code: 'asc' },
        },
        courses: {
          include: {
            _count: {
              select: {
                lessons: true,
                subscriptions: true,
              },
            },
          },
        },
      },
    });

    if (!unitStandard) {
      return NextResponse.json(
        { error: 'Unit standard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ unitStandard });
  } catch (error: any) {
    console.error('Error fetching unit standard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unit standard', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/unit-standards/[id] - Update a unit standard (Admin only)
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
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, knqfLevel, version, isActive } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description || null;
    if (knqfLevel !== undefined) updateData.knqfLevel = parseInt(knqfLevel);
    if (version !== undefined) updateData.version = version;
    if (isActive !== undefined) updateData.isActive = isActive;

    const unitStandard = await prisma.unitStandard.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ unitStandard });
  } catch (error: any) {
    console.error('Error updating unit standard:', error);
    return NextResponse.json(
      { error: 'Failed to update unit standard', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/unit-standards/[id] - Delete a unit standard (Admin only)
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
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Check if unit standard is in use
    const unitStandard = await prisma.unitStandard.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            courses: true,
            competencyUnits: true,
          },
        },
      },
    });

    if (!unitStandard) {
      return NextResponse.json(
        { error: 'Unit standard not found' },
        { status: 404 }
      );
    }

    if (unitStandard._count.courses > 0 || unitStandard._count.competencyUnits > 0) {
      return NextResponse.json(
        { error: 'Cannot delete unit standard that is in use. Deactivate it instead.' },
        { status: 409 }
      );
    }

    await prisma.unitStandard.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Unit standard deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting unit standard:', error);
    return NextResponse.json(
      { error: 'Failed to delete unit standard', details: error.message },
      { status: 500 }
    );
  }
}
