import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/instructor/courses/[id]/cohorts/[cohortId]/export - Export cohort grades as CSV with pivot table format
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

    const students = Array.from(studentMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    // Get all grades for students in this cohort for this course
    const grades = await prisma.grade.findMany({
      where: {
        studentId: { in: students.map(s => s.id) },
        lesson: {
          courseId,
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
              },
            },
          },
        },
        lesson: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
      },
    });

    // Get unique exercises that have at least one grade
    const exerciseMap = new Map<string, {
      id: string;
      title: string;
      lesson: {
        id: string;
        number: number;
        title: string;
      };
    }>();

    grades.forEach(grade => {
      if (grade.exercise && !exerciseMap.has(grade.exerciseId)) {
        exerciseMap.set(grade.exerciseId, {
          id: grade.exercise.id,
          title: grade.exercise.title,
          lesson: grade.lesson,
        });
      }
    });

    // Convert to array and sort by lesson number and title
    const exercises = Array.from(exerciseMap.values()).sort((a, b) => {
      if (a.lesson.number !== b.lesson.number) {
        return a.lesson.number - b.lesson.number;
      }
      return a.title.localeCompare(b.title);
    });

    // Create a map of studentId -> exerciseId -> grade
    const gradeMap = new Map<string, Map<string, number>>();
    grades.forEach(grade => {
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
      ...exercises.map(ex => `L${ex.lesson.number}: ${escapeCsv(ex.title)}`),
      'Average Grade',
      'Total Exercises Graded',
    ];
    csvRows.push(headers.join(','));

    // Data rows: One row per student
    students.forEach(student => {
      const studentGrades = gradeMap.get(student.id) || new Map();
      const exerciseScores = exercises.map(ex => {
        const score = studentGrades.get(ex.id);
        return score !== undefined ? score.toString() : '';
      });
      
      const totalGraded = exerciseScores.filter(s => s !== '').length;
      const averageGrade = totalGraded > 0
        ? Math.round(
            exerciseScores
              .filter(s => s !== '')
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
        'Content-Disposition': `attachment; filename="cohort-grades-${cohortId}-${courseId}.csv"`,
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
