import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Student } from '@/lib/types';

// GET /api/students/[id] - Get a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const formattedStudent: Student = {
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
    };

    return NextResponse.json({ student: formattedStudent });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update a specific student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, registrationNumber, cohortId } = body;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if registration number is being changed and if it already exists
    if (registrationNumber && registrationNumber !== existingStudent.registrationNumber) {
      const duplicateCheck = await prisma.student.findUnique({
        where: { registrationNumber },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Student with this registration number already exists' },
          { status: 409 }
        );
      }
    }

    // Validate cohort if provided
    if (cohortId !== undefined && cohortId !== null) {
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

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(registrationNumber && { registrationNumber }),
        ...(cohortId !== undefined && { cohortId: cohortId || null }),
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
      id: updatedStudent.id,
      name: updatedStudent.name,
      email: updatedStudent.email || undefined,
      registrationNumber: updatedStudent.registrationNumber,
      cohortId: updatedStudent.cohortId || undefined,
      userId: updatedStudent.userId || undefined,
      cohort: updatedStudent.cohort ? {
        id: updatedStudent.cohort.id,
        name: updatedStudent.cohort.name
      } : undefined
    };

    return NextResponse.json({ student: formattedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Delete a specific student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete student (this will cascade delete related grades and sessions)
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
