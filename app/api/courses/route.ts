import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculatePriceWithTax } from '@/lib/tax';

// GET - Get all courses
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const includeSubscribed = searchParams.get('includeSubscribed') === 'true';

    // Get student profile if user is a student
    let studentId: string | null = null;
    if (session?.user && (session.user as any).role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      studentId = student?.id || null;
    }

    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            lessons: true,
            subscriptions: true,
          },
        },
        ...(session?.user && includeSubscribed
          ? {
              subscriptions: {
                where: {
                  OR: [
                    { userId: session.user.id, status: 'active' },
                    ...(studentId ? [{ studentId, status: 'active' }] : []),
                  ],
                },
                select: {
                  id: true,
                  status: true,
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const coursesWithSubscriptionStatus = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      isActive: course.isActive,
      lessonCount: course._count.lessons,
      subscriberCount: course._count.subscriptions,
      isSubscribed: session?.user && includeSubscribed
        ? course.subscriptions && course.subscriptions.length > 0
        : false,
      createdAt: course.createdAt,
    }));

    return NextResponse.json({ courses: coursesWithSubscriptionStatus });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create a new course (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, basePrice } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Course title is required' },
        { status: 400 }
      );
    }

    // Calculate price inclusive of tax if basePrice is provided
    const price = basePrice !== undefined && basePrice !== null && basePrice !== ''
      ? calculatePriceWithTax(parseFloat(basePrice))
      : null;

    const course = await prisma.course.create({
      data: {
        title,
        description: description || null,
        price: price !== null ? price : undefined,
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: 'Course created successfully', course },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// PATCH - Update course (admin only)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { id, isActive, title, description, basePrice } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    
    // Calculate price inclusive of tax if basePrice is provided
    if (basePrice !== undefined && basePrice !== null && basePrice !== '') {
      updateData.price = calculatePriceWithTax(parseFloat(basePrice));
    } else if (basePrice === null || basePrice === '') {
      // Allow clearing the price by sending null or empty string
      updateData.price = null;
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Course updated successfully', course });
  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

