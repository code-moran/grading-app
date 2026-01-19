import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get all lessons not assigned to a specific course
// Since courseId is now required, this endpoint returns all lessons
// that can be reassigned (for admin) or lessons from other courses (for instructors)
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
    if (userRole !== 'admin' && userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const excludeCourseId = searchParams.get('excludeCourseId');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // For instructors, only show lessons from courses they're not assigned to
    // For admins, show all lessons except those in the specified course
    let whereClause: any = {};
    
    if (excludeCourseId) {
      whereClause.courseId = {
        not: excludeCourseId,
      };
    }

    // If instructor, only show lessons from courses they're not managing
    if (userRole === 'instructor') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: (session.user as any).id },
        include: {
          courses: {
            select: {
              courseId: true,
            },
          },
        },
      });

      if (instructor) {
        const assignedCourseIds = instructor.courses.map((ci) => ci.courseId);
        whereClause.courseId = {
          notIn: excludeCourseId 
            ? [...assignedCourseIds, excludeCourseId]
            : assignedCourseIds,
        };
      }
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      orderBy: { number: 'asc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            exercises: true,
          },
        },
      },
    });

    return NextResponse.json({ lessons });
  } catch (error: any) {
    console.error('Error fetching available lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

