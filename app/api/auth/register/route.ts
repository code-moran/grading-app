import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, registrationNumber, department, title } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['student', 'instructor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be student or instructor' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });

      // Create role-specific profile
      if (role === 'student') {
        if (!registrationNumber) {
          throw new Error('Registration number is required');
        }

        // Check if registration number already exists
        const existingStudent = await tx.student.findUnique({
          where: { registrationNumber },
        });

        let student;
        if (existingStudent) {
          // If student exists but already has a userId, someone else registered
          if (existingStudent.userId) {
            throw new Error('Student with this registration number is already linked to an account');
          }
          
          // For in-class students (existing student profile), use instructor-provided name
          // This ensures instructor-provided names override user-provided names
          const instructorProvidedName = existingStudent.name;
          
          // Update User record to use instructor-provided name
          await tx.user.update({
            where: { id: user.id },
            data: {
              name: instructorProvidedName,
            },
          });
          
          // Link the existing student record to the new user account
          // Use instructor-provided name and provided email (or keep existing email)
          student = await tx.student.update({
            where: { registrationNumber },
            data: {
              userId: user.id,
              email: email || existingStudent.email, // Use provided email or keep existing
              name: instructorProvidedName, // Always use instructor-provided name
            },
          });
        } else {
          // Create new student record
          student = await tx.student.create({
            data: {
              userId: user.id,
              name,
              email,
              registrationNumber,
            },
          });
        }

        return { user, profile: student };
      } else if (role === 'instructor') {
        // Check if instructor email already exists
        const existingInstructor = await tx.instructor.findUnique({
          where: { email },
        });

        if (existingInstructor) {
          throw new Error('Instructor with this email already exists');
        }

        const instructor = await tx.instructor.create({
          data: {
            userId: user.id,
            name,
            email,
            department: department || null,
            title: title || null,
            isApproved: false, // Requires admin approval
          },
        });

        return { user, profile: instructor };
      }

      return { user, profile: null };
    });

    // Get the final user record (in case name was updated for existing student)
    const finalUser = await prisma.user.findUnique({
      where: { id: result.user.id },
    });

    return NextResponse.json(
      {
        message: role === 'instructor' 
          ? 'Account created successfully. Please wait for admin approval.'
          : 'Account created successfully',
        user: {
          id: finalUser!.id,
          email: finalUser!.email,
          name: finalUser!.name, // This will be instructor-provided name for existing students
          role: finalUser!.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

