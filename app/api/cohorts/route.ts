import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/cohorts - Get all cohorts
export async function GET() {
  try {
    const cohorts = await prisma.cohort.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error('Error fetching cohorts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohorts' },
      { status: 500 }
    );
  }
}

// POST /api/cohorts - Create a new cohort
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
    if (userRole !== 'admin' && userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, startDate, endDate, isActive } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Cohort name is required' },
        { status: 400 }
      );
    }

    // Check if cohort name already exists
    const existingCohort = await prisma.cohort.findUnique({
      where: { name: name.trim() },
    });

    if (existingCohort) {
      return NextResponse.json(
        { error: 'Cohort with this name already exists' },
        { status: 409 }
      );
    }

    // Create new cohort
    const newCohort = await prisma.cohort.create({
      data: {
        name: name.trim(),
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return NextResponse.json({ cohort: newCohort }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating cohort:', error);
    return NextResponse.json(
      { error: 'Failed to create cohort' },
      { status: 500 }
    );
  }
}

