import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuizAttempt } from "@/lib/types";

// GET /api/quiz-attempts - Get quiz attempts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const lessonId = searchParams.get("lessonId");

    const whereClause: any = {};

    if (studentId) {
      whereClause.studentId = studentId;
    }

    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: whereClause,
      orderBy: { completedAt: "desc" },
    });

    const formattedAttempts: QuizAttempt[] = attempts.map((attempt) => ({
      id: attempt.id,
      studentId: attempt.studentId,
      lessonId: attempt.lessonId,
      questions: attempt.questions as any,
      score: attempt.score,
      passed: attempt.passed,
      completedAt: attempt.completedAt,
      timeSpent: attempt.timeSpent,
    }));

    return NextResponse.json({ attempts: formattedAttempts });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz attempts" },
      { status: 500 }
    );
  }
}

// POST /api/quiz-attempts - Create a new quiz attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, lessonId, questions, score, passed, timeSpent } = body;

    // Validate required fields
    if (
      !studentId ||
      !lessonId ||
      !questions ||
      score === undefined ||
      passed === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating quiz attempt:", {
      studentId,
      lessonId,
      questions,
      score,
      passed,
      timeSpent,
    });
    const newAttempt = await prisma.quizAttempt.create({
      data: {
        studentId,
        lessonId,
        questions: questions as any,
        score,
        passed,
        timeSpent: timeSpent || 0,
      },
    });

    const formattedAttempt: QuizAttempt = {
      id: newAttempt.id,
      studentId: newAttempt.studentId,
      lessonId: newAttempt.lessonId,
      questions: newAttempt.questions as any,
      score: newAttempt.score,
      passed: newAttempt.passed,
      completedAt: newAttempt.completedAt,
      timeSpent: newAttempt.timeSpent,
    };

    return NextResponse.json({ attempt: formattedAttempt }, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz attempt:", error);
    return NextResponse.json(
      { error: "Failed to create quiz attempt" },
      { status: 500 }
    );
  }
}
