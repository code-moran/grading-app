import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/grades/export - Export grades with advanced filtering
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
    if (!['instructor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. Instructor or Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    const studentId = searchParams.get('studentId');
    const exerciseId = searchParams.get('exerciseId');
    const cohortId = searchParams.get('cohortId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minPercentage = searchParams.get('minPercentage');
    const maxPercentage = searchParams.get('maxPercentage');
    const letterGrade = searchParams.get('letterGrade');

    // Build where clause
    const whereClause: any = {};
    
    if (studentId) {
      whereClause.studentId = studentId;
    }

    if (cohortId) {
      whereClause.student = {
        cohortId: cohortId,
      };
    }
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    if (exerciseId) {
      whereClause.exerciseId = exerciseId;
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

    if (minPercentage !== null && minPercentage !== undefined || maxPercentage !== null && maxPercentage !== undefined) {
      whereClause.percentage = {};
      if (minPercentage !== null && minPercentage !== undefined) {
        whereClause.percentage.gte = parseInt(minPercentage);
      }
      if (maxPercentage !== null && maxPercentage !== undefined) {
        whereClause.percentage.lte = parseInt(maxPercentage);
      }
    }

    if (letterGrade) {
      whereClause.letterGrade = {
        startsWith: letterGrade,
      };
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
            email: true,
            cohortId: true,
            cohort: {
              select: {
                id: true,
                name: true,
              },
            },
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
      orderBy: [
        { student: { name: 'asc' } },
        { lesson: { number: 'asc' } },
        { exercise: { title: 'asc' } },
      ],
    });

    // Group grades by student
    const studentGradesMap = new Map<string, any[]>();
    const studentsMap = new Map<string, any>();

    grades.forEach((grade) => {
      const studentId = grade.studentId;
      
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          studentId: grade.student.id,
          studentName: grade.student.name,
          registrationNumber: grade.student.registrationNumber,
          email: grade.student.email,
          cohortId: grade.student.cohortId,
          cohortName: grade.student.cohort?.name || null,
        });
      }

      if (!studentGradesMap.has(studentId)) {
        studentGradesMap.set(studentId, []);
      }
      
      studentGradesMap.get(studentId)!.push({
        lessonId: grade.lessonId,
        lessonTitle: `Lesson ${grade.lesson.number}: ${grade.lesson.title}`,
        courseId: grade.lesson.courseId,
        courseTitle: grade.lesson.course?.title || 'Unknown Course',
        exerciseId: grade.exerciseId,
        exerciseTitle: grade.exercise?.title || 'Unknown Exercise',
        points: grade.totalPoints,
        maxPoints: grade.exercise?.maxPoints || grade.maxPossiblePoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        feedback: grade.feedback,
        gradedBy: grade.gradedBy,
        gradedAt: grade.gradedAt,
      });
    });

    // Calculate statistics for each student
    const bulkExportData = Array.from(studentsMap.values()).map((student) => {
      const studentGrades = studentGradesMap.get(student.studentId) || [];
      
      // Calculate best grade
      let bestPercentage = 0;
      let bestLetterGrade = 'F';
      
      if (studentGrades.length > 0) {
        const percentages = studentGrades.map((g: any) => g.percentage);
        bestPercentage = Math.max(...percentages);
        
        if (bestPercentage >= 90) bestLetterGrade = 'A';
        else if (bestPercentage >= 80) bestLetterGrade = 'B';
        else if (bestPercentage >= 70) bestLetterGrade = 'C';
        else if (bestPercentage >= 60) bestLetterGrade = 'D';
        else bestLetterGrade = 'F';
      }

      // Calculate average grade
      const averageGrade = studentGrades.length > 0 
        ? Math.round(studentGrades.reduce((sum: number, grade: any) => sum + grade.percentage, 0) / studentGrades.length)
        : 0;

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        registrationNumber: student.registrationNumber,
        email: student.email,
        cohortId: student.cohortId,
        cohortName: student.cohortName,
        bestGrade: bestPercentage,
        bestPercentage,
        bestLetterGrade,
        completedExercises: studentGrades.length,
        averageGrade,
        grades: studentGrades,
      };
    });

    return NextResponse.json({ 
      success: true,
      data: bulkExportData,
      message: `Exported grades for ${bulkExportData.length} students`,
      filters: {
        courseId: courseId || null,
        lessonId: lessonId || null,
        studentId: studentId || null,
        exerciseId: exerciseId || null,
        cohortId: cohortId || null,
        startDate: startDate || null,
        endDate: endDate || null,
        minPercentage: minPercentage || null,
        maxPercentage: maxPercentage || null,
        letterGrade: letterGrade || null,
      },
    });
  } catch (error: any) {
    console.error('Error exporting grades:', error);
    return NextResponse.json(
      { error: 'Failed to export grades', details: error.message },
      { status: 500 }
    );
  }
}
