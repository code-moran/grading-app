import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { number: 'asc' },
          include: {
            _count: {
              select: {
                exercises: true,
                quizAttempts: true,
              },
            },
          },
        },
        subscriptions: {
          where: { status: 'active' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                registrationNumber: true,
              },
            },
          },
          orderBy: { subscribedAt: 'desc' },
        },
        _count: {
          select: {
            lessons: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete course (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    const { id } = params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course (lessons will be unlinked due to onDelete: SetNull)
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

