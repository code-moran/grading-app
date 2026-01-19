import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/instructor/courses - Get courses assigned to the logged-in instructor
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
    if (userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Instructor access required.' },
        { status: 403 }
      );
    }

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        courses: {
          include: {
            course: {
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
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    // Format courses
    const courses = instructor.courses.map((ci) => ({
      id: ci.course.id,
      title: ci.course.title,
      description: ci.course.description,
      isActive: ci.course.isActive,
      lessonCount: ci.course._count.lessons,
      subscriberCount: ci.course._count.subscriptions,
      assignedAt: ci.assignedAt,
      createdAt: ci.course.createdAt,
      updatedAt: ci.course.updatedAt,
    }));

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching instructor courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

