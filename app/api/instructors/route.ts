import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/instructors - Get all approved instructors (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const instructors = await prisma.instructor.findMany({
      where: {
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedInstructors = instructors.map((instructor) => ({
      id: instructor.id,
      userId: instructor.userId,
      name: instructor.name,
      email: instructor.email,
      department: instructor.department,
      title: instructor.title,
      isApproved: instructor.isApproved,
      approvedAt: instructor.approvedAt,
    }));

    return NextResponse.json({ instructors: formattedInstructors }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
}

