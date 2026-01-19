const { PrismaClient } = require('@prisma/client');

async function addTestProgress() {
  const prisma = new PrismaClient();
  
  try {
    const studentId = 'cmfsdqbww00019xeztpecx5fy';
    
    console.log('Adding test quiz attempts for student:', studentId);
    
    // Add quiz attempts for existing lessons
    const lessons = ['lesson-01', 'lesson-09', 'lesson-10', 'lesson-11', 'lesson-12'];
    
    for (let i = 0; i < lessons.length; i++) {
      const lessonId = lessons[i];
      
      // Check if attempt already exists
      const existing = await prisma.quizAttempt.findFirst({
        where: {
          studentId: studentId,
          lessonId: lessonId
        }
      });
      
      if (existing) {
        console.log(`Quiz attempt for ${lessonId} already exists, skipping...`);
        continue;
      }
      
      const attempt = await prisma.quizAttempt.create({
        data: {
          studentId: studentId,
          lessonId: lessonId,
          questions: [
            {
              questionId: `q1-${lessonId}`,
              selectedAnswer: 0,
              correctAnswer: 0,
              isCorrect: true
            },
            {
              questionId: `q2-${lessonId}`,
              selectedAnswer: 1,
              correctAnswer: 1,
              isCorrect: true
            }
          ],
          score: 100,
          passed: true,
          timeSpent: 300 + (i * 60), // Varying time spent
        },
      });
      
      console.log(`Created quiz attempt for ${lessonId}:`, attempt.id);
    }
    
    // Check final state
    const allAttempts = await prisma.quizAttempt.findMany({
      where: { studentId: studentId },
      orderBy: { completedAt: 'asc' }
    });
    
    console.log(`\nTotal quiz attempts for student: ${allAttempts.length}`);
    allAttempts.forEach(attempt => {
      console.log(`- ${attempt.lessonId}: ${attempt.passed ? 'PASSED' : 'FAILED'} (${attempt.score}%)`);
    });
    
  } catch (error) {
    console.error('Error adding test progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProgress();
