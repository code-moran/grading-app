import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[id]/instructors - Get instructors assigned to a course
export async function GET(
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

    const courseId = params.id;

    const courseInstructors = await prisma.courseInstructor.findMany({
      where: { courseId },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const instructors = courseInstructors.map((ci) => ({
      id: ci.instructor.id,
      userId: ci.instructor.userId,
      name: ci.instructor.name,
      email: ci.instructor.email,
      department: ci.instructor.department,
      title: ci.instructor.title,
      assignedAt: ci.assignedAt,
      assignedBy: ci.assignedBy,
    }));

    return NextResponse.json({ instructors }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching course instructors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/instructors - Assign instructor to course (admin only)
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

    const courseId = params.id;
    const body = await request.json();
    const { instructorId } = body;

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Verify instructor exists and is approved
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }

    if (!instructor.isApproved) {
      return NextResponse.json(
        { error: 'Instructor must be approved before assignment' },
        { status: 400 }
      );
    }

    // Check if already assigned
    const existing = await prisma.courseInstructor.findUnique({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Instructor is already assigned to this course' },
        { status: 409 }
      );
    }

    // Assign instructor
    const courseInstructor = await prisma.courseInstructor.create({
      data: {
        courseId,
        instructorId,
        assignedBy: (session.user as any).id,
      },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Instructor assigned successfully',
        instructor: {
          id: courseInstructor.instructor.id,
          name: courseInstructor.instructor.name,
          email: courseInstructor.instructor.email,
          assignedAt: courseInstructor.assignedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error assigning instructor:', error);
    return NextResponse.json(
      { error: 'Failed to assign instructor' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/instructors - Unassign instructor from course (admin only)
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

    const courseId = params.id;
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Delete assignment
    await prisma.courseInstructor.delete({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId,
        },
      },
    });

    return NextResponse.json(
      { message: 'Instructor unassigned successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error unassigning instructor:', error);
    return NextResponse.json(
      { error: 'Failed to unassign instructor' },
      { status: 500 }
    );
  }
}

