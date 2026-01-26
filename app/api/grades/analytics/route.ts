import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering since we use getServerSession (which uses headers)
export const dynamic = 'force-dynamic';

// GET /api/grades/analytics - Get grade analytics and statistics
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
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const whereClause: any = {};
    
    if (studentId) {
      whereClause.studentId = studentId;
    }
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    if (courseId) {
      whereClause.lesson = {
        courseId: courseId,
      };
    }

    if (startDate || endDate) {
      whereClause.gradedAt = {};
      if (startDate) {
        whereClause.gradedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.gradedAt.lte = new Date(endDate);
      }
    }

    // Fetch grades with related data
    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
          },
        },
        lesson: {
          select: {
            id: true,
            number: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
          },
        },
      },
      orderBy: { gradedAt: 'desc' },
    });

    if (grades.length === 0) {
      return NextResponse.json({
        analytics: {
          totalGrades: 0,
          averagePercentage: 0,
          averagePoints: 0,
          totalPoints: 0,
          maxPossiblePoints: 0,
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
          trends: [],
          courseStats: [],
          lessonStats: [],
          studentStats: [],
        },
      });
    }

    // Calculate overall statistics
    const totalGrades = grades.length;
    const totalPoints = grades.reduce((sum, g) => sum + g.totalPoints, 0);
    const maxPossiblePoints = grades.reduce((sum, g) => sum + (g.exercise?.maxPoints || g.maxPossiblePoints), 0);
    const averagePercentage = Math.round(
      grades.reduce((sum, g) => sum + g.percentage, 0) / totalGrades
    );
    const averagePoints = Math.round(totalPoints / totalGrades);

    // Grade distribution
    const gradeDistribution = {
      A: grades.filter((g) => g.letterGrade.startsWith('A')).length,
      B: grades.filter((g) => g.letterGrade.startsWith('B')).length,
      C: grades.filter((g) => g.letterGrade.startsWith('C')).length,
      D: grades.filter((g) => g.letterGrade.startsWith('D')).length,
      F: grades.filter((g) => g.letterGrade.startsWith('F')).length,
    };

    // Trends over time (group by week)
    const trendsMap = new Map<string, { count: number; totalPercentage: number }>();
    grades.forEach((grade) => {
      const date = new Date(grade.gradedAt);
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      const existing = trendsMap.get(weekKey) || { count: 0, totalPercentage: 0 };
      trendsMap.set(weekKey, {
        count: existing.count + 1,
        totalPercentage: existing.totalPercentage + grade.percentage,
      });
    });

    const trends = Array.from(trendsMap.entries())
      .map(([week, data]) => ({
        week,
        count: data.count,
        averagePercentage: Math.round(data.totalPercentage / data.count),
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Course statistics
    const courseStatsMap = new Map<string, { name: string; grades: typeof grades }>();
    grades.forEach((grade) => {
      if (grade.lesson?.course) {
        const courseId = grade.lesson.course.id;
        const existing = courseStatsMap.get(courseId) || {
          name: grade.lesson.course.title,
          grades: [],
        };
        existing.grades.push(grade);
        courseStatsMap.set(courseId, existing);
      }
    });

    const courseStats = Array.from(courseStatsMap.entries()).map(([courseId, data]) => {
      const courseGrades = data.grades;
      const courseTotal = courseGrades.length;
      const courseAvg = Math.round(
        courseGrades.reduce((sum, g) => sum + g.percentage, 0) / courseTotal
      );
      return {
        courseId,
        courseName: data.name,
        totalGrades: courseTotal,
        averagePercentage: courseAvg,
        gradeDistribution: {
          A: courseGrades.filter((g) => g.letterGrade.startsWith('A')).length,
          B: courseGrades.filter((g) => g.letterGrade.startsWith('B')).length,
          C: courseGrades.filter((g) => g.letterGrade.startsWith('C')).length,
          D: courseGrades.filter((g) => g.letterGrade.startsWith('D')).length,
          F: courseGrades.filter((g) => g.letterGrade.startsWith('F')).length,
        },
      };
    });

    // Lesson statistics
    const lessonStatsMap = new Map<string, { number: number; title: string; grades: typeof grades }>();
    grades.forEach((grade) => {
      if (grade.lesson) {
        const lessonId = grade.lesson.id;
        const existing = lessonStatsMap.get(lessonId) || {
          number: grade.lesson.number,
          title: grade.lesson.title,
          grades: [],
        };
        existing.grades.push(grade);
        lessonStatsMap.set(lessonId, existing);
      }
    });

    const lessonStats = Array.from(lessonStatsMap.entries())
      .map(([lessonId, data]) => {
        const lessonGrades = data.grades;
        const lessonTotal = lessonGrades.length;
        const lessonAvg = Math.round(
          lessonGrades.reduce((sum, g) => sum + g.percentage, 0) / lessonTotal
        );
        return {
          lessonId,
          lessonNumber: data.number,
          lessonTitle: data.title,
          totalGrades: lessonTotal,
          averagePercentage: lessonAvg,
        };
      })
      .sort((a, b) => a.lessonNumber - b.lessonNumber);

    // Student statistics (if not filtering by specific student)
    let studentStats: any[] = [];
    if (!studentId) {
      const studentStatsMap = new Map<string, { name: string; regNumber: string; grades: typeof grades }>();
      grades.forEach((grade) => {
        const sid = grade.studentId;
        const existing = studentStatsMap.get(sid) || {
          name: grade.student.name,
          regNumber: grade.student.registrationNumber,
          grades: [],
        };
        existing.grades.push(grade);
        studentStatsMap.set(sid, existing);
      });

      studentStats = Array.from(studentStatsMap.entries())
        .map(([studentId, data]) => {
          const studentGrades = data.grades;
          const studentTotal = studentGrades.length;
          const studentAvg = Math.round(
            studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentTotal
          );
          return {
            studentId,
            studentName: data.name,
            registrationNumber: data.regNumber,
            totalGrades: studentTotal,
            averagePercentage: studentAvg,
            totalPoints: studentGrades.reduce((sum, g) => sum + g.totalPoints, 0),
            maxPossiblePoints: studentGrades.reduce(
              (sum, g) => sum + (g.exercise?.maxPoints || g.maxPossiblePoints),
              0
            ),
          };
        })
        .sort((a, b) => b.averagePercentage - a.averagePercentage)
        .slice(0, 20); // Top 20 students
    }

    return NextResponse.json({
      analytics: {
        totalGrades,
        averagePercentage,
        averagePoints,
        totalPoints,
        maxPossiblePoints,
        gradeDistribution,
        trends,
        courseStats,
        lessonStats,
        studentStats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching grade analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade analytics' },
      { status: 500 }
    );
  }
}
