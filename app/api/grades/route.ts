import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Grade, BulkGradeExport } from '@/lib/types';

// GET /api/grades - Get all grades with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const studentId = searchParams.get('studentId');
    const exerciseId = searchParams.get('exerciseId');

    const whereClause: any = {};
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }
    
    if (studentId) {
      whereClause.studentId = studentId;
    }
    
    if (exerciseId) {
      whereClause.exerciseId = exerciseId;
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: true,
        lesson: true,
        exercise: true,
        gradeCriteria: {
          include: {
            criteria: true,
            level: true,
          },
        },
      },
      orderBy: { gradedAt: 'desc' },
    });

    const formattedGrades: any[] = grades.map((grade: any) => ({
      id: grade.id,
      studentId: grade.studentId,
      lessonId: grade.lessonId,
      exerciseId: grade.exerciseId,
      criteriaGrades: grade.gradeCriteria.map((criteria: any) => ({
        criteriaId: criteria.criteriaId,
        levelId: criteria.levelId,
        points: criteria.points,
        comments: criteria.comments || '',
        criteriaName: criteria.criteria?.name,
        levelName: criteria.level?.name,
      })),
      totalPoints: grade.totalPoints,
      maxPossiblePoints: grade.maxPossiblePoints,
      percentage: grade.percentage,
      letterGrade: grade.letterGrade,
      feedback: grade.feedback,
      gradedBy: grade.gradedBy,
      gradedAt: grade.gradedAt,
      lesson: grade.lesson
        ? {
            id: grade.lesson.id,
            number: grade.lesson.number,
            title: grade.lesson.title,
            courseId: grade.lesson.courseId,
          }
        : null,
      exercise: grade.exercise
        ? {
            id: grade.exercise.id,
            title: grade.exercise.title,
          }
        : null,
    }));

    return NextResponse.json({ grades: formattedGrades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

// POST /api/grades - Create a new grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      lessonId,
      exerciseId,
      criteriaGrades,
      totalPoints,
      percentage,
      letterGrade,
      feedback,
      gradedBy
    } = body;

    // Validate required fields
    if (!studentId || !lessonId || !exerciseId || totalPoints === undefined || percentage === undefined || !letterGrade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use Prisma transaction
    const newGrade = await prisma.$transaction(async (tx: any) => {
      // First, try to find existing grade
      const existingGrade = await tx.grade.findUnique({
        where: {
          studentId_exerciseId: {
            studentId,
            exerciseId,
          },
        },
      });

      let grade;
      if (existingGrade) {
        // Update existing grade
        grade = await tx.grade.update({
          where: { id: existingGrade.id },
          data: {
            totalPoints,
            percentage,
            letterGrade,
            feedback: feedback || null,
            gradedBy: gradedBy || 'Instructor',
            gradedAt: new Date(),
          },
        });
      } else {
        // Create new grade
        grade = await tx.grade.create({
          data: {
            studentId,
            lessonId,
            exerciseId,
            totalPoints,
            percentage,
            letterGrade,
            feedback: feedback || null,
            gradedBy: gradedBy || 'Instructor',
          },
        });
      }

      // Delete existing criteria grades for this grade
      await tx.gradeCriteria.deleteMany({
        where: { gradeId: grade.id },
      });

      // Insert criteria grades if provided
      if (criteriaGrades && Array.isArray(criteriaGrades)) {
        await tx.gradeCriteria.createMany({
          data: criteriaGrades.map(criteriaGrade => ({
            gradeId: grade.id,
            criteriaId: criteriaGrade.criteriaId,
            levelId: criteriaGrade.levelId,
            points: criteriaGrade.points,
            comments: criteriaGrade.comments || null,
          })),
        });
      }

      return grade;
    });

    const formattedGrade: Grade = {
      id: newGrade.id,
      studentId: newGrade.studentId,
      lessonId: newGrade.lessonId,
      exerciseId: newGrade.exerciseId,
      criteriaGrades: criteriaGrades || [],
      totalPoints: newGrade.totalPoints,
      maxPossiblePoints: newGrade.maxPossiblePoints,
      percentage: newGrade.percentage,
      letterGrade: newGrade.letterGrade,
      feedback: newGrade.feedback,
      gradedBy: newGrade.gradedBy,
      gradedAt: newGrade.gradedAt
    };

    return NextResponse.json({ grade: formattedGrade }, { status: 201 });
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json(
      { error: 'Failed to create grade' },
      { status: 500 }
    );
  }
}
