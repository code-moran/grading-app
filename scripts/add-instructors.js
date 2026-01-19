const { PrismaClient } = require('@prisma/client');

async function addInstructors() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Adding instructor accounts...');
    
    const instructors = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        department: 'Computer Science',
        title: 'Professor'
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        department: 'Web Development',
        title: 'Associate Professor'
      },
      {
        name: 'Ms. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        department: 'Digital Media',
        title: 'Lecturer'
      }
    ];
    
    for (const instructor of instructors) {
      try {
        // Check if instructor already exists
        const existing = await prisma.instructor.findUnique({
          where: { email: instructor.email }
        });
        
        if (existing) {
          console.log(`Instructor ${instructor.email} already exists, skipping...`);
          continue;
        }
        
        const created = await prisma.instructor.create({
          data: instructor
        });
        
        console.log(`Created instructor: ${created.name} (${created.email})`);
      } catch (error) {
        console.error(`Error creating instructor ${instructor.email}:`, error.message);
      }
    }
    
    // Check final count
    const totalInstructors = await prisma.instructor.count();
    console.log(`\nTotal instructors in database: ${totalInstructors}`);
    
    console.log('\nTest credentials for instructors:');
    console.log('Email: sarah.johnson@university.edu');
    console.log('Password: password123');
    console.log('Role: instructor');
    
  } catch (error) {
    console.error('Error adding instructors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addInstructors();
