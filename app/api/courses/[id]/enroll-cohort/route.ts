import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/courses/[id]/enroll-cohort - Enroll all students in a cohort to a course
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
    if (!['admin', 'instructor'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const courseId = params.id;
    const body = await request.json();
    const { cohortId } = body;

    if (!cohortId) {
      return NextResponse.json(
        { error: 'Cohort ID is required' },
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

    // Check if cohort exists
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        students: true, // Get all students, not just those with User accounts
      },
    });

    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    if (cohort.students.length === 0) {
      return NextResponse.json(
        { error: 'No students in this cohort' },
        { status: 400 }
      );
    }

    // Enroll all students in the cohort to the course using studentId directly
    const results = await prisma.$transaction(async (tx) => {
      const enrolled: string[] = [];
      const alreadyEnrolled: string[] = [];
      const errors: string[] = [];

      for (const student of cohort.students) {
        try {
          // Check if already subscribed (by studentId or userId if exists)
          let existingSubscription = null;

          if (student.userId) {
            // Check by userId first if student has a user account
            existingSubscription = await tx.courseSubscription.findUnique({
              where: {
                userId_courseId: {
                  userId: student.userId,
                  courseId,
                },
              },
            });
          }

          // Also check by studentId
          if (!existingSubscription) {
            const studentSubscription = await tx.courseSubscription.findFirst({
              where: {
                studentId: student.id,
                courseId,
              },
            });
            if (studentSubscription) {
              existingSubscription = studentSubscription;
            }
          }

          if (existingSubscription) {
            if (existingSubscription.status === 'active') {
              alreadyEnrolled.push(student.name);
            } else {
              // Reactivate subscription
              await tx.courseSubscription.update({
                where: { id: existingSubscription.id },
                data: {
                  status: 'active',
                  subscribedAt: new Date(),
                },
              });
              enrolled.push(student.name);
            }
          } else {
            // Create new subscription using studentId
            await tx.courseSubscription.create({
              data: {
                studentId: student.id,
                courseId,
                userId: student.userId || null, // Include userId if student has one
                status: 'active',
              },
            });
            enrolled.push(student.name);
          }
        } catch (error: any) {
          errors.push(`${student.name}: ${error.message}`);
        }
      }

      return { enrolled, alreadyEnrolled, errors };
    });

    return NextResponse.json({
      success: true,
      message: `Enrollment completed for cohort "${cohort.name}"`,
      enrolled: results.enrolled.length,
      alreadyEnrolled: results.alreadyEnrolled.length,
      errors: results.errors.length,
      details: {
        enrolled: results.enrolled,
        alreadyEnrolled: results.alreadyEnrolled,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    console.error('Error enrolling cohort:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enroll cohort' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/enroll-cohort - Unenroll a cohort from a course
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
    if (!['admin', 'instructor'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Instructor access required.' },
        { status: 403 }
      );
    }

    const courseId = params.id;
    const { searchParams } = new URL(request.url);
    const cohortId = searchParams.get('cohortId');

    if (!cohortId) {
      return NextResponse.json(
        { error: 'Cohort ID is required' },
        { status: 400 }
      );
    }

    // Check if cohort exists
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        students: true, // Get all students, not just those with User accounts
      },
    });

    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Unenroll all students in the cohort from the course
    const results = await prisma.$transaction(async (tx) => {
      const unenrolled: string[] = [];
      const notEnrolled: string[] = [];

      for (const student of cohort.students) {
        try {
          // Find subscription by studentId or userId
          let subscription = null;

          if (student.userId) {
            subscription = await tx.courseSubscription.findUnique({
              where: {
                userId_courseId: {
                  userId: student.userId,
                  courseId,
                },
              },
            });
          }

          if (!subscription) {
            const studentSubscription = await tx.courseSubscription.findFirst({
              where: {
                studentId: student.id,
                courseId,
              },
            });
            if (studentSubscription) {
              subscription = studentSubscription;
            }
          }

          if (subscription) {
            await tx.courseSubscription.update({
              where: { id: subscription.id },
              data: { status: 'cancelled' },
            });
            unenrolled.push(student.name);
          } else {
            notEnrolled.push(student.name);
          }
        } catch (error: any) {
          console.error(`Error unenrolling ${student.name}:`, error);
        }
      }

      return { unenrolled, notEnrolled };
    });

    return NextResponse.json({
      success: true,
      message: `Unenrollment completed for cohort "${cohort.name}"`,
      unenrolled: results.unenrolled.length,
      notEnrolled: results.notEnrolled.length,
      details: {
        unenrolled: results.unenrolled,
        notEnrolled: results.notEnrolled,
      },
    });
  } catch (error: any) {
    console.error('Error unenrolling cohort:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unenroll cohort' },
      { status: 500 }
    );
  }
}

