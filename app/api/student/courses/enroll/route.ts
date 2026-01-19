import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/student/courses/enroll - Enroll student in a course
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
    if (userRole !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden. Student access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get student profile (by userId or find by user's studentProfile)
    let student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    // If not found by userId, try to find via user's studentProfile relation
    if (!student) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { studentProfile: true },
      });
      if (user?.studentProfile) {
        student = { id: user.studentProfile.id };
      }
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
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

    if (!course.isActive) {
      return NextResponse.json(
        { error: 'Course is not active' },
        { status: 400 }
      );
    }

    // Check if already enrolled (by userId or studentId)
    const existingByUserId = await prisma.courseSubscription.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    const existingByStudentId = await prisma.courseSubscription.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId,
        },
      },
    });

    if (existingByUserId || existingByStudentId) {
      // Update to active if exists but inactive
      const existing = existingByUserId || existingByStudentId;
      if (existing && existing.status !== 'active') {
        await prisma.courseSubscription.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            subscribedAt: new Date(),
            userId: session.user.id,
            studentId: student.id,
          },
        });
        return NextResponse.json({
          message: 'Successfully enrolled in course',
        });
      }
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }

    // Create subscription with both userId and studentId
    const subscription = await prisma.courseSubscription.create({
      data: {
        userId: session.user.id,
        studentId: student.id,
        courseId,
        status: 'active',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Successfully enrolled in course',
      subscription,
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

