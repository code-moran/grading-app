import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/instructor/courses/[id]/lessons - Assign lesson to course (instructor only for their courses)
export async function POST(
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
    if (userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Instructor access required.' },
        { status: 403 }
      );
    }

    const courseId = params.id;
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    // Check if instructor is assigned to this course
    const courseInstructor = await prisma.courseInstructor.findUnique({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId: instructor.id,
        },
      },
    });

    if (!courseInstructor) {
      return NextResponse.json(
        { error: 'You are not assigned to this course' },
        { status: 403 }
      );
    }

    // Check if lesson exists and is not already assigned to another course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (lesson.courseId && lesson.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Lesson is already assigned to another course' },
        { status: 409 }
      );
    }

    // Assign lesson to course
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { courseId },
      include: {
        _count: {
          select: {
            exercises: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Lesson assigned successfully',
        lesson: {
          id: updatedLesson.id,
          number: updatedLesson.number,
          title: updatedLesson.title,
          exerciseCount: updatedLesson._count.exercises,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error assigning lesson:', error);
    return NextResponse.json(
      { error: 'Failed to assign lesson' },
      { status: 500 }
    );
  }
}

// DELETE /api/instructor/courses/[id]/lessons - Unassign lesson from course
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
    if (userRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Forbidden. Instructor access required.' },
        { status: 403 }
      );
    }

    const courseId = params.id;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    // Check if instructor is assigned to this course
    const courseInstructor = await prisma.courseInstructor.findUnique({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId: instructor.id,
        },
      },
    });

    if (!courseInstructor) {
      return NextResponse.json(
        { error: 'You are not assigned to this course' },
        { status: 403 }
      );
    }

    // Check if lesson belongs to this course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Lesson not found or not assigned to this course' },
        { status: 404 }
      );
    }

    // Note: We can't unassign because courseId is now required
    // Instead, we should prevent deletion or require reassignment
    // For now, we'll return an error suggesting to contact admin
    return NextResponse.json(
      { error: 'Cannot unassign lesson. Please contact admin to reassign to another course.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error unassigning lesson:', error);
    return NextResponse.json(
      { error: 'Failed to unassign lesson' },
      { status: 500 }
    );
  }
}

