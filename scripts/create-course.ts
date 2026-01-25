import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCourse() {
  try {
    // Check if course already exists
    const existingCourse = await prisma.course.findFirst({
      where: { title: 'Web Design Fundamentals' },
    });

    if (existingCourse) {
      console.log('Course already exists');
      return;
    }

    // Create default course
    const course = await prisma.course.create({
      data: {
        title: 'Web Design Fundamentals',
        description: 'A comprehensive course covering HTML, CSS, JavaScript, and modern web development practices.',
        isActive: true,
      },
    });

    console.log('Course created successfully:');
    console.log(`Title: ${course.title}`);
    console.log(`ID: ${course.id}`);

    // Note: All lessons must have a courseId (required field)
    // This script creates a course but doesn't automatically link lessons
    // Lessons should be linked to courses when they are created
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCourse();

