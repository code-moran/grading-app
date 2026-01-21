import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Assign lesson to course
export async function POST(
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

    const { id: courseId } = params;
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Assign lesson to course
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        courseId: courseId,
      },
    });

    return NextResponse.json({
      message: 'Lesson assigned to course successfully',
      lesson: updatedLesson,
    });
  } catch (error: any) {
    console.error('Error assigning lesson:', error);
    return NextResponse.json(
      { error: 'Failed to assign lesson to course' },
      { status: 500 }
    );
  }
}

// DELETE - Unassign lesson from course
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

    const { id: courseId } = params;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    // Delete lesson (lessons must always be linked to a course, so we delete instead of unassigning)
    // This will cascade delete exercises, quiz questions, quiz attempts, and grades
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({
      message: 'Lesson deleted successfully',
    });
  } catch (error: any) {
    console.error('Error unassigning lesson:', error);
    return NextResponse.json(
      { error: 'Failed to unassign lesson from course' },
      { status: 500 }
    );
  }
}

