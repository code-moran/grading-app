import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/instructor/cohorts/[cohortId]/export - Export cohort grades across all enrolled courses
export async function GET(
  request: NextRequest,
  { params }: { params: { cohortId: string } }
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

    const cohortId = params.cohortId;

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    const instructorCourseIds = instructor.courses.map((ci) => ci.course.id);

    if (instructorCourseIds.length === 0) {
      return NextResponse.json(
        { error: 'No courses assigned to instructor' },
        { status: 404 }
      );
    }

    // Get cohort information
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }

    // Get all students in this cohort
    const students = await prisma.student.findMany({
      where: { cohortId },
      select: {
        id: true,
        name: true,
        email: true,
        registrationNumber: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No students in this cohort' },
        { status: 404 }
      );
    }

    const studentIds = students.map((s) => s.id);

    // Get all courses these students are enrolled in (that instructor teaches)
    const enrolledCourses = await prisma.courseSubscription.findMany({
      where: {
        studentId: { in: studentIds },
        courseId: { in: instructorCourseIds },
        status: 'active',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      distinct: ['courseId'],
    });

    const courseIds = enrolledCourses.map((ec) => ec.course.id);

    if (courseIds.length === 0) {
      return NextResponse.json(
        { error: 'No enrolled courses found for this cohort' },
        { status: 404 }
      );
    }

    // Get all grades for students in this cohort across all enrolled courses
    const grades = await prisma.grade.findMany({
      where: {
        studentId: { in: studentIds },
        lesson: {
          courseId: { in: courseIds },
        },
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            lesson: {
              select: {
                id: true,
                number: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        lesson: {
          select: {
            id: true,
            number: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Get unique exercises that have at least one grade, grouped by course
    const exerciseMap = new Map<string, {
      id: string;
      title: string;
      courseId: string;
      courseTitle: string;
      lesson: {
        id: string;
        number: number;
        title: string;
      };
    }>();

    grades.forEach((grade) => {
      if (grade.exercise && !exerciseMap.has(grade.exerciseId)) {
        exerciseMap.set(grade.exerciseId, {
          id: grade.exercise.id,
          title: grade.exercise.title,
          courseId: grade.lesson.course.id,
          courseTitle: grade.lesson.course.title,
          lesson: grade.lesson,
        });
      }
    });

    // Convert to array and sort by course title, then lesson number, then exercise title
    const exercises = Array.from(exerciseMap.values()).sort((a, b) => {
      if (a.courseTitle !== b.courseTitle) {
        return a.courseTitle.localeCompare(b.courseTitle);
      }
      if (a.lesson.number !== b.lesson.number) {
        return a.lesson.number - b.lesson.number;
      }
      return a.title.localeCompare(b.title);
    });

    // Create a map of studentId -> exerciseId -> grade
    const gradeMap = new Map<string, Map<string, number>>();
    grades.forEach((grade) => {
      if (!gradeMap.has(grade.studentId)) {
        gradeMap.set(grade.studentId, new Map());
      }
      gradeMap.get(grade.studentId)!.set(grade.exerciseId, grade.percentage);
    });

    // Helper function to escape CSV values
    const escapeCsv = (value: string | null | undefined): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Build CSV content
    const csvRows: string[] = [];

    // Header row: Student info columns + one column per exercise
    const headers = [
      'Student Name',
      'Registration Number',
      'Email',
      ...exercises.map((ex) => `${escapeCsv(ex.courseTitle)} - L${ex.lesson.number}: ${escapeCsv(ex.title)}`),
      'Average Grade (All Courses)',
      'Total Exercises Graded',
    ];
    csvRows.push(headers.join(','));

    // Data rows: One row per student
    students.forEach((student) => {
      const studentGrades = gradeMap.get(student.id) || new Map();
      const exerciseScores = exercises.map((ex) => {
        const score = studentGrades.get(ex.id);
        return score !== undefined ? score.toString() : '';
      });

      const totalGraded = exerciseScores.filter((s) => s !== '').length;
      const averageGrade =
        totalGraded > 0
          ? Math.round(
              exerciseScores
                .filter((s) => s !== '')
                .reduce((sum, s) => sum + parseFloat(s), 0) / totalGraded
            )
          : 0;

      const row = [
        escapeCsv(student.name),
        escapeCsv(student.registrationNumber),
        escapeCsv(student.email),
        ...exerciseScores,
        averageGrade.toString(),
        totalGraded.toString(),
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Return CSV as response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cohort-${escapeCsv(cohort.name)}-all-courses-grades.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting cohort grades:', error);
    return NextResponse.json(
      { error: 'Failed to export cohort grades' },
      { status: 500 }
    );
  }
}
