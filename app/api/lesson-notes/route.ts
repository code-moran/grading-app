import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LessonNote } from '@/lib/types';

// GET /api/lesson-notes - Get lesson notes with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    const whereClause: any = {};
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    const notes = await prisma.lessonNote.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    const formattedNotes: LessonNote[] = notes.map(note => ({
      id: note.id,
      lessonId: note.lessonId,
      lessonNumber: note.lessonNumber,
      lessonTitle: note.lessonTitle,
      title: note.title,
      content: note.content,
      section: note.section as any,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));

    return NextResponse.json({ notes: formattedNotes });
  } catch (error) {
    console.error('Error fetching lesson notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson notes' },
      { status: 500 }
    );
  }
}

// POST /api/lesson-notes - Create a new lesson note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lessonId,
      lessonNumber,
      lessonTitle,
      title,
      content,
      section
    } = body;

    // Validate required fields
    if (!lessonId || !title || !content || !section) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newNote = await prisma.lessonNote.create({
      data: {
        lessonId,
        lessonNumber,
        lessonTitle,
        title,
        content,
        section,
      },
    });

    const formattedNote: LessonNote = {
      id: newNote.id,
      lessonId: newNote.lessonId,
      lessonNumber: newNote.lessonNumber,
      lessonTitle: newNote.lessonTitle,
      title: newNote.title,
      content: newNote.content,
      section: newNote.section as any,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt
    };

    return NextResponse.json({ note: formattedNote }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson note:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson note' },
      { status: 500 }
    );
  }
}

// PUT /api/lesson-notes - Update an existing lesson note
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      content,
      section
    } = body;

    // Validate required fields
    if (!id || !title || !content || !section) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedNote = await prisma.lessonNote.update({
      where: { id },
      data: {
        title,
        content,
        section,
      },
    });

    const formattedNote: LessonNote = {
      id: updatedNote.id,
      lessonId: updatedNote.lessonId,
      lessonNumber: updatedNote.lessonNumber,
      lessonTitle: updatedNote.lessonTitle,
      title: updatedNote.title,
      content: updatedNote.content,
      section: updatedNote.section as any,
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt
    };

    return NextResponse.json({ note: formattedNote });
  } catch (error) {
    console.error('Error updating lesson note:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson note' },
      { status: 500 }
    );
  }
}
