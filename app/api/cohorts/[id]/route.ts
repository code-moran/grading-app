import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/cohorts/[id] - Get a specific cohort
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const cohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            email: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ cohort });
  } catch (error) {
    console.error('Error fetching cohort:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort' },
      { status: 500 }
    );
  }
}

// PUT /api/cohorts/[id] - Update a specific cohort
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
    if (userRole !== 'admin' && userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, startDate, endDate, isActive } = body;

    // Check if cohort exists
    const existingCohort = await prisma.cohort.findUnique({
      where: { id },
    });

    if (!existingCohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Check if name is being changed and if it already exists
    if (name && name.trim() !== existingCohort.name) {
      const duplicateCheck = await prisma.cohort.findUnique({
        where: { name: name.trim() },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Cohort with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update cohort
    const updatedCohort = await prisma.cohort.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description || null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return NextResponse.json({ cohort: updatedCohort });
  } catch (error: any) {
    console.error('Error updating cohort:', error);
    return NextResponse.json(
      { error: 'Failed to update cohort' },
      { status: 500 }
    );
  }
}

// DELETE /api/cohorts/[id] - Delete a specific cohort
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
    if (userRole !== 'admin' && userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if cohort exists
    const existingCohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!existingCohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Check if cohort has students
    if (existingCohort._count.students > 0) {
      return NextResponse.json(
        { error: 'Cannot delete cohort with assigned students. Please remove students first or set cohort to inactive.' },
        { status: 400 }
      );
    }

    // Delete cohort
    await prisma.cohort.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cohort deleted successfully' });
  } catch (error) {
    console.error('Error deleting cohort:', error);
    return NextResponse.json(
      { error: 'Failed to delete cohort' },
      { status: 500 }
    );
  }
}

