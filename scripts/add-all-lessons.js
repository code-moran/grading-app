const { PrismaClient } = require('@prisma/client');

async function addAllLessons() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Adding all lessons to database...');
    
    const allLessons = [
      { id: 'lesson-01', number: 1, title: 'Introduction to HTML', description: 'Understanding HTML basics, document structure, and core elements', duration: '2 Hours' },
      { id: 'lesson-02', number: 2, title: 'Basic HTML Elements', description: 'Understanding common HTML elements and their proper usage', duration: '2 Hours' },
      { id: 'lesson-03', number: 3, title: 'Web Page Formatting and Layout Elements', description: 'Understanding HTML elements for page structure and layout', duration: '2 Hours' },
      { id: 'lesson-04', number: 4, title: 'Apply Styles with Internal CSS', description: 'Understanding CSS basics and applying styles within HTML documents', duration: '2 Hours' },
      { id: 'lesson-05', number: 5, title: 'Apply Styles with External CSS', description: 'Understanding external CSS files and separation of concerns', duration: '2 Hours' },
      { id: 'lesson-06', number: 6, title: 'Understand JavaScript Basics', description: 'Introduction to JavaScript programming fundamentals', duration: '2 Hours' },
      { id: 'lesson-07', number: 7, title: 'JavaScript Data Types', description: 'Understanding JavaScript data types and type conversion', duration: '2 Hours' },
      { id: 'lesson-08', number: 8, title: 'JavaScript Arrays', description: 'Understanding arrays and array methods in JavaScript', duration: '2 Hours' },
      { id: 'lesson-09', number: 9, title: 'JavaScript Functions', description: 'Understanding function declaration, parameters, return values, and scope', duration: '2 Hours' },
      { id: 'lesson-10', number: 10, title: 'JavaScript Libraries (jQuery Introduction)', description: 'Introduction to jQuery library and its benefits', duration: '2 Hours' },
      { id: 'lesson-11', number: 11, title: 'jQuery Syntax and Selectors', description: 'Understanding jQuery syntax and various selector types', duration: '2 Hours' },
      { id: 'lesson-12', number: 12, title: 'jQuery Events', description: 'Understanding and implementing jQuery event handling', duration: '2 Hours' },
      { id: 'lesson-13', number: 13, title: 'jQuery DOM Manipulation', description: 'Understanding DOM manipulation using jQuery methods', duration: '2 Hours' },
      { id: 'lesson-14', number: 14, title: 'Project 1 Interactive Portfolio', description: 'Creating an interactive portfolio website with HTML, CSS, and JavaScript', duration: '2 Hours' },
      { id: 'lesson-15', number: 15, title: 'Project 1 Interactive Portfolio Part 2', description: 'Advanced portfolio features with smooth scrolling and form validation', duration: '2 Hours' },
      { id: 'lesson-16', number: 16, title: 'Responsive Web Design and Media Queries', description: 'Understanding responsive design principles and implementing media queries', duration: '2 Hours' },
      { id: 'lesson-17', number: 17, title: 'CSS Grid Layout', description: 'Understanding and implementing CSS Grid for complex layouts', duration: '2 Hours' },
      { id: 'lesson-18', number: 18, title: 'CSS Animations and Transitions', description: 'Creating smooth animations and transitions using CSS', duration: '2 Hours' },
      { id: 'lesson-19', number: 19, title: 'Advanced CSS Selectors', description: 'Understanding complex CSS selectors and specificity', duration: '2 Hours' },
      { id: 'lesson-20', number: 20, title: 'JavaScript Control Flow Conditionals', description: 'Understanding conditional statements and logical operators', duration: '2 Hours' },
      { id: 'lesson-21', number: 21, title: 'JavaScript Control Flow Loops', description: 'Understanding and implementing various loop structures', duration: '2 Hours' },
      { id: 'lesson-22', number: 22, title: 'JavaScript Objects', description: 'Understanding object creation, properties, and methods', duration: '2 Hours' },
      { id: 'lesson-23', number: 23, title: 'JavaScript Events Advanced', description: 'Understanding event flow, delegation, and advanced event handling', duration: '2 Hours' },
      { id: 'lesson-24', number: 24, title: 'Asynchronous JavaScript Callbacks and Promises', description: 'Understanding asynchronous programming with callbacks and promises', duration: '2 Hours' },
      { id: 'lesson-25', number: 25, title: 'Asynchronous JavaScript Async/Await', description: 'Understanding async/await syntax and modern asynchronous programming', duration: '2 Hours' },
      { id: 'lesson-26', number: 26, title: 'Introduction to Web APIs and Fetch API', description: 'Understanding web APIs and making HTTP requests with Fetch', duration: '2 Hours' },
      { id: 'lesson-27', number: 27, title: 'Client-Side Data Storage', description: 'Understanding localStorage and sessionStorage for data persistence', duration: '2 Hours' },
      { id: 'lesson-28', number: 28, title: 'Introduction to Version Control with Git', description: 'Understanding Git basics and version control workflow', duration: '2 Hours' },
      { id: 'lesson-29', number: 29, title: 'Introduction to GitHub and Remote Repositories', description: 'Understanding GitHub and remote repository management', duration: '2 Hours' },
      { id: 'lesson-30', number: 30, title: 'Web Hosting and Deployment', description: 'Understanding web hosting and deploying static websites', duration: '2 Hours' }
    ];
    
    for (const lesson of allLessons) {
      try {
        // Check if lesson already exists
        const existing = await prisma.lesson.findUnique({
          where: { id: lesson.id }
        });
        
        if (existing) {
          console.log(`Lesson ${lesson.id} already exists, skipping...`);
          continue;
        }
        
        const created = await prisma.lesson.create({
          data: lesson
        });
        
        console.log(`Created lesson: ${created.id} - ${created.title}`);
      } catch (error) {
        console.error(`Error creating lesson ${lesson.id}:`, error.message);
      }
    }
    
    // Check final count
    const totalLessons = await prisma.lesson.count();
    console.log(`\nTotal lessons in database: ${totalLessons}`);
    
  } catch (error) {
    console.error('Error adding lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAllLessons();
