import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Grade, BulkGradeExport } from '@/lib/types';
import { createAuditLog } from '@/lib/audit-log';

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
      // TVETA/CBET Compliance Fields
      isCompetent: grade.isCompetent,
      competencyStatus: grade.competencyStatus,
      assessorId: grade.assessorId,
      verifiedBy: grade.verifiedBy,
      verifiedAt: grade.verifiedAt,
      moderatedBy: grade.moderatedBy,
      moderatedAt: grade.moderatedAt,
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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      studentId,
      lessonId,
      exerciseId,
      criteriaGrades,
      totalPoints,
      maxPossiblePoints,
      percentage,
      letterGrade,
      feedback,
      gradedBy,
      isCompetent,
      competencyStatus,
      assessorId,
      verifiedBy,
      moderatedBy
    } = body;

    // Validate required fields
    if (!studentId || !lessonId || !exerciseId || totalPoints === undefined || percentage === undefined || !letterGrade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine competency status if not provided
    // TVETA/CBET: Typically >= 70% is considered competent
    let finalCompetencyStatus = competencyStatus;
    let finalIsCompetent = isCompetent;
    
    if (finalCompetencyStatus === undefined) {
      if (percentage >= 70) {
        finalCompetencyStatus = 'competent';
        finalIsCompetent = true;
      } else if (percentage >= 50) {
        finalCompetencyStatus = 'needs_improvement';
        finalIsCompetent = false;
      } else {
        finalCompetencyStatus = 'not_competent';
        finalIsCompetent = false;
      }
    }

    // Get assessor ID from session if not provided
    let finalAssessorId = assessorId;
    if (!finalAssessorId && (session.user as any).role === 'instructor') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      finalAssessorId = instructor?.id || null;
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Use Prisma transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // First, try to find existing grade
      const existingGrade = await tx.grade.findUnique({
        where: {
          studentId_exerciseId: {
            studentId,
            exerciseId,
          },
        },
      });

      const previousValue = existingGrade ? {
        totalPoints: existingGrade.totalPoints,
        percentage: existingGrade.percentage,
        letterGrade: existingGrade.letterGrade,
        competencyStatus: existingGrade.competencyStatus,
        isCompetent: existingGrade.isCompetent,
      } : null;

      let grade;
      if (existingGrade) {
        // Update existing grade
        grade = await tx.grade.update({
          where: { id: existingGrade.id },
          data: {
            totalPoints,
            maxPossiblePoints: maxPossiblePoints || existingGrade.maxPossiblePoints,
            percentage,
            letterGrade,
            isCompetent: finalIsCompetent,
            competencyStatus: finalCompetencyStatus,
            assessorId: finalAssessorId || null,
            verifiedBy: verifiedBy || null,
            verifiedAt: verifiedBy ? new Date() : null,
            moderatedBy: moderatedBy || null,
            moderatedAt: moderatedBy ? new Date() : null,
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
            maxPossiblePoints: maxPossiblePoints || totalPoints,
            percentage,
            letterGrade,
            isCompetent: finalIsCompetent,
            competencyStatus: finalCompetencyStatus,
            assessorId: finalAssessorId || null,
            verifiedBy: verifiedBy || null,
            verifiedAt: verifiedBy ? new Date() : null,
            moderatedBy: moderatedBy || null,
            moderatedAt: moderatedBy ? new Date() : null,
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

      return { grade, previousValue };
    });

    const { grade: newGrade, previousValue } = result;

    // Create audit log entry
    const userRole = (session.user as any).role;
    const auditAction = previousValue ? 'updated' : 'assessed';
    
    await createAuditLog({
      gradeId: newGrade.id,
      action: auditAction,
      performedBy: session.user.id,
      performedByRole: userRole === 'admin' ? 'admin' : 
                       userRole === 'instructor' ? 'assessor' : 'instructor',
      previousValue,
      newValue: {
        totalPoints: newGrade.totalPoints,
        percentage: newGrade.percentage,
        letterGrade: newGrade.letterGrade,
        competencyStatus: newGrade.competencyStatus,
        isCompetent: newGrade.isCompetent,
      },
      ipAddress: ipAddress as string,
      userAgent,
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
      isCompetent: newGrade.isCompetent,
      competencyStatus: newGrade.competencyStatus,
      assessorId: newGrade.assessorId,
      verifiedBy: newGrade.verifiedBy,
      verifiedAt: newGrade.verifiedAt,
      moderatedBy: newGrade.moderatedBy,
      moderatedAt: newGrade.moderatedAt,
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
