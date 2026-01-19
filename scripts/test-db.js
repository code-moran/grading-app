const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const studentCount = await prisma.student.count();
    console.log('Student count:', studentCount);
    
    const lessonCount = await prisma.lesson.count();
    console.log('Lesson count:', lessonCount);
    
    const quizAttemptCount = await prisma.quizAttempt.count();
    console.log('Quiz attempt count:', quizAttemptCount);
    
    // Try to create a test quiz attempt
    console.log('Creating test quiz attempt...');
    const testAttempt = await prisma.quizAttempt.create({
      data: {
        studentId: 'student-1',
        lessonId: 'lesson-01',
        questions: [
          {
            questionId: 'q1',
            selectedAnswer: 0,
            correctAnswer: 0,
            isCorrect: true
          }
        ],
        score: 100,
        passed: true,
        timeSpent: 300,
      },
    });
    
    console.log('Test quiz attempt created:', testAttempt);
    
    // Try to fetch it back
    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId: 'student-1' }
    });
    
    console.log('Quiz attempts for student-1:', attempts);
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
