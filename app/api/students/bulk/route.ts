import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Student, BulkStudentUpload } from '@/lib/types';

// POST /api/students/bulk - Bulk upload students
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { students }: { students: BulkStudentUpload[] } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'Students array is required and must not be empty' },
        { status: 400 }
      );
    }

    const results: Student[] = [];
    const errors: string[] = [];

    // Use Prisma transaction
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < students.length; i++) {
        const studentData = students[i];
        const { name, registrationNumber, cohortId } = studentData;

        // Validate required fields
        if (!name || !registrationNumber) {
          errors.push(`Row ${i + 1}: Name and registration number are required`);
          continue;
        }

        // Check if registration number already exists
        const existingStudent = await tx.student.findUnique({
          where: { registrationNumber },
        });

        if (existingStudent) {
          errors.push(`Row ${i + 1}: Student with registration number ${registrationNumber} already exists`);
          continue;
        }

        // Validate cohort if provided
        if (cohortId) {
          const cohortExists = await tx.cohort.findUnique({
            where: { id: cohortId },
          });
          if (!cohortExists) {
            errors.push(`Row ${i + 1}: Cohort not found`);
            continue;
          }
        }

        // Create student (User is optional - can be created later for authentication)
        const newStudent = await tx.student.create({
          data: {
            name,
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

        results.push(formattedStudent);
      }
    });

    return NextResponse.json({
      success: true,
      students: results,
      errors: errors,
      message: `Successfully created ${results.length} students${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    });

  } catch (error) {
    console.error('Error bulk creating students:', error);
    return NextResponse.json(
      { error: 'Failed to bulk create students' },
      { status: 500 }
    );
  }
}
