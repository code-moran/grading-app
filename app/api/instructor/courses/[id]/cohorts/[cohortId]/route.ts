import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/instructor/courses/[id]/cohorts/[cohortId] - Get detailed cohort information for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; cohortId: string } }
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
    const cohortId = params.cohortId;

    // Verify instructor has access to this course
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        courses: {
          where: { courseId },
        },
      },
    });

    if (!instructor || instructor.courses.length === 0) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Get cohort information
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
    });

    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Get course with lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            title: true,
            description: true,
            duration: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get all students in the cohort who are enrolled in this course
    const subscriptions = await prisma.courseSubscription.findMany({
      where: {
        courseId,
        status: 'active',
        OR: [
          {
            user: {
              studentProfile: {
                cohortId,
              },
            },
          },
          {
            student: {
              cohortId,
            },
          },
        ],
      },
      include: {
        user: {
          include: {
            studentProfile: {
              select: {
                id: true,
                name: true,
                email: true,
                registrationNumber: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true,
          },
        },
      },
    });

    // Extract unique students
    const studentMap = new Map<string, {
      id: string;
      name: string;
      email: string | null;
      registrationNumber: string;
    }>();

    for (const sub of subscriptions) {
      let student: { id: string; name: string; email: string | null; registrationNumber: string } | null = null;

      if (sub.user?.studentProfile) {
        student = sub.user.studentProfile;
      } else if (sub.student) {
        student = sub.student;
      }

      if (student && !studentMap.has(student.id)) {
        studentMap.set(student.id, student);
      }
    }

    const students = Array.from(studentMap.values());

    // Get grades for all students in this cohort for this course
    const grades = await prisma.grade.findMany({
      where: {
        studentId: { in: students.map(s => s.id) },
        lesson: {
          courseId,
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
          },
        },
      },
      orderBy: {
        gradedAt: 'desc',
      },
    });

    // Calculate statistics
    const totalStudents = students.length;
    const studentsWithGrades = new Set(grades.map(g => g.studentId)).size;
    const averageGrade = grades.length > 0
      ? Math.round(
          grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length
        )
      : 0;

    // Calculate per-student statistics
    const studentStats = students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id);
      const studentAverage = studentGrades.length > 0
        ? Math.round(
            studentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / studentGrades.length
          )
        : 0;
      const completedLessons = new Set(studentGrades.map(g => g.lessonId)).size;

      return {
        studentId: student.id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        email: student.email,
        totalGrades: studentGrades.length,
        averageGrade: studentAverage,
        completedLessons,
      };
    });

    return NextResponse.json({
      cohort: {
        id: cohort.id,
        name: cohort.name,
        description: cohort.description,
        isActive: cohort.isActive,
      },
      course: {
        id: course.id,
        title: course.title,
        lessons: course.lessons,
      },
      stats: {
        totalStudents,
        studentsWithGrades,
        studentsWithoutGrades: totalStudents - studentsWithGrades,
        averageGrade,
        totalGrades: grades.length,
        totalLessons: course.lessons.length,
      },
      students: studentStats,
      grades: grades.map(grade => ({
        id: grade.id,
        studentId: grade.studentId,
        studentName: grade.student.name,
        studentRegistration: grade.student.registrationNumber,
        lessonId: grade.lessonId,
        exerciseId: grade.exerciseId,
        lessonNumber: grade.lesson.number,
        lessonTitle: grade.lesson.title,
        exerciseTitle: grade.exercise.title,
        totalPoints: grade.totalPoints,
        maxPossiblePoints: grade.maxPossiblePoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        feedback: grade.feedback,
        gradedAt: grade.gradedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching cohort details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort details' },
      { status: 500 }
    );
  }
}
