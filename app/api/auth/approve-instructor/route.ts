import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { instructorId } = body;

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Approve instructor
    const instructor = await prisma.instructor.update({
      where: { id: instructorId },
      data: {
        isApproved: true,
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Instructor approved successfully',
      instructor: {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        isApproved: instructor.isApproved,
      },
    });
  } catch (error: any) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve instructor' },
      { status: 500 }
    );
  }
}

// GET - Get pending instructors
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const pendingInstructors = await prisma.instructor.findMany({
      where: { isApproved: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ instructors: pendingInstructors });
  } catch (error: any) {
    console.error('Error fetching pending instructors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending instructors' },
      { status: 500 }
    );
  }
}

