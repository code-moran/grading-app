import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Lesson, Exercise, Rubric, RubricCriteria, RubricLevel } from '@/lib/types';

// GET /api/lessons - Get all lessons with their exercises
export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        exercises: {
          include: {
            rubric: {
              include: {
                criteriaMappings: {
                  include: {
                    criteria: true,
                  },
                },
                levelMappings: {
                  include: {
                    level: true,
                  },
                },
              },
            },
          },
          orderBy: { title: 'asc' },
        },
      },
      orderBy: { number: 'asc' },
    });

    const formattedLessons: Lesson[] = lessons.map(lesson => ({
      id: lesson.id,
      number: lesson.number,
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration || '',
      exercises: lesson.exercises.map(exercise => ({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description || '',
        maxPoints: exercise.maxPoints,
        rubric: {
          id: exercise.rubric.id,
          name: exercise.rubric.name,
          description: exercise.rubric.description || '',
          totalPoints: exercise.rubric.totalPoints,
          criteria: exercise.rubric.criteriaMappings.map(mapping => ({
            id: mapping.criteria.id,
            name: mapping.criteria.name,
            description: mapping.criteria.description || '',
            weight: mapping.criteria.weight,
          })),
          levels: exercise.rubric.levelMappings.map(mapping => ({
            id: mapping.level.id,
            name: mapping.level.name,
            description: mapping.level.description || '',
            points: mapping.level.points,
            color: mapping.level.color || 'bg-gray-100',
          })),
        },
      })),
    }));

    return NextResponse.json({ lessons: formattedLessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Create a new lesson (requires courseId)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, title, description, duration, courseId } = body;

    // Validate required fields
    if (!number || !title) {
      return NextResponse.json(
        { error: 'Lesson number and title are required' },
        { status: 400 }
      );
    }

    // Validate courseId is required
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required. Lessons must be assigned to a course.' },
        { status: 400 }
      );
    }

    // Verify course exists and is active
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found. Lessons must be assigned to a valid course.' },
        { status: 404 }
      );
    }

    // Check if lesson number already exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { number },
    });

    if (existingLesson) {
      return NextResponse.json(
        { error: 'Lesson with this number already exists' },
        { status: 409 }
      );
    }

    // Create new lesson
    const newLesson = await prisma.lesson.create({
      data: {
        number,
        title,
        description: description || null,
        duration: duration || null,
        courseId,
      },
    });

    const formattedLesson: Lesson = {
      id: newLesson.id,
      number: newLesson.number,
      title: newLesson.title,
      description: newLesson.description || '',
      duration: newLesson.duration || '',
      exercises: []
    };

    return NextResponse.json({ lesson: formattedLesson }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
