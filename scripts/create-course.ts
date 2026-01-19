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

    // Link existing lessons to this course
    const lessons = await prisma.lesson.findMany({
      orderBy: { number: 'asc' },
    });

    if (lessons.length > 0) {
      await prisma.lesson.updateMany({
        where: {
          courseId: null,
        },
        data: {
          courseId: course.id,
        },
      });
      console.log(`Linked ${lessons.length} lessons to the course`);
    }
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCourse();

