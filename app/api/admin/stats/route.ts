import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
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

    // Get statistics in parallel
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      approvedInstructors,
      pendingInstructors,
      totalCourses,
      activeCourses,
      totalSubscriptions,
      recentRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.instructor.count(),
      prisma.instructor.count({ where: { isApproved: true } }),
      prisma.instructor.count({ where: { isApproved: false } }),
      prisma.course.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.courseSubscription.count({ where: { status: 'active' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        approvedInstructors,
        pendingInstructors,
        totalCourses,
        activeCourses,
        totalSubscriptions,
      },
      recentRegistrations,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

