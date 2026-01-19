const { PrismaClient } = require('@prisma/client');

async function checkStudents() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking students in database...');
    
    const students = await prisma.student.findMany({
      take: 5
    });
    
    console.log('Students found:', students.length);
    students.forEach(student => {
      console.log(`- ID: ${student.id}, Name: ${student.name}, Registration: ${student.registrationNumber}`);
    });
    
    if (students.length > 0) {
      const firstStudent = students[0];
      console.log(`\nUsing student: ${firstStudent.id} (${firstStudent.name})`);
      
      // Try to create a quiz attempt with an existing student
      const testAttempt = await prisma.quizAttempt.create({
        data: {
          studentId: firstStudent.id,
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
      
      console.log('Test quiz attempt created successfully:', testAttempt);
      
      // Fetch it back
      const attempts = await prisma.quizAttempt.findMany({
        where: { studentId: firstStudent.id }
      });
      
      console.log('Quiz attempts for this student:', attempts);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
