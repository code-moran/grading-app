const { PrismaClient } = require('@prisma/client');

async function checkLessons() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking lessons in database...');
    
    const lessons = await prisma.lesson.findMany({
      take: 10,
      orderBy: { number: 'asc' }
    });
    
    console.log('Lessons found:', lessons.length);
    lessons.forEach(lesson => {
      console.log(`- ID: ${lesson.id}, Number: ${lesson.number}, Title: ${lesson.title}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLessons();
