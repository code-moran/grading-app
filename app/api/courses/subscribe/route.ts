import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Subscribe to a course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Check if already subscribed
    const existingSubscription = await prisma.courseSubscription.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed to this course' },
        { status: 409 }
      );
    }

    // Create or update subscription
    const subscription = await prisma.courseSubscription.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
      update: {
        status: 'active',
        subscribedAt: new Date(),
      },
      create: {
        userId: session.user.id,
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
      message: 'Successfully subscribed to course',
      subscription,
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe to course' },
      { status: 500 }
    );
  }
}

// GET - Get user's subscriptions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscriptions = await prisma.courseSubscription.findMany({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            isActive: true,
          },
        },
      },
      orderBy: { subscribedAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

