import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Student } from '@/lib/types';

// GET /api/students - Get all students (with optional userId filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedStudents: Student[] = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email || undefined,
      registrationNumber: student.registrationNumber,
      cohortId: student.cohortId || undefined,
      userId: student.userId || undefined,
      cohort: student.cohort ? {
        id: student.cohort.id,
        name: student.cohort.name
      } : undefined
    }));

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, registrationNumber, cohortId } = body;

    // Validate required fields
    if (!name || !registrationNumber) {
      return NextResponse.json(
        { error: 'Name and registration number are required' },
        { status: 400 }
      );
    }

    // Check if registration number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { registrationNumber },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this registration number already exists' },
        { status: 409 }
      );
    }

    // Validate cohort if provided
    if (cohortId) {
      const cohortExists = await prisma.cohort.findUnique({
        where: { id: cohortId },
      });
      if (!cohortExists) {
        return NextResponse.json(
          { error: 'Cohort not found' },
          { status: 404 }
        );
      }
    }

    // Create student (User is optional - can be created later for authentication)
    const newStudent = await prisma.student.create({
      data: {
        name,
        email: email || null,
        registrationNumber,
        cohortId: cohortId || null,
        // userId is optional - can be set later when user account is created
      },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedStudent: Student = {
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email || undefined,
      registrationNumber: newStudent.registrationNumber,
      cohortId: newStudent.cohortId || undefined,
      userId: newStudent.userId || undefined,
      cohort: newStudent.cohort ? {
        id: newStudent.cohort.id,
        name: newStudent.cohort.name
      } : undefined
    };

    return NextResponse.json({ student: formattedStudent }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
