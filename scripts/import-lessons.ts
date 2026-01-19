import { PrismaClient } from '@prisma/client';
import { lessons } from '../lib/lessons';
import { quizQuestionsByLessonNumber } from '../lib/quiz-questions';

const prisma = new PrismaClient();

interface RubricLevel {
  name: string;
  description: string;
  points: number;
  color: string;
}

interface RubricCriteria {
  name: string;
  description: string;
  weight: number;
}

interface ExerciseData {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  rubric: {
    id: string;
    name: string;
    description: string;
    criteria: RubricCriteria[];
    levels: RubricLevel[];
    totalPoints: number;
  };
}

interface LessonData {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  exercises: ExerciseData[];
}

// Common rubric levels that are shared across all lessons
const commonLevels: RubricLevel[] = [
  {
    name: "Excellent (4)",
    description: "Exceeds expectations with exceptional quality and understanding",
    points: 4,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  {
    name: "Good (3)",
    description: "Meets expectations with good quality and understanding",
    points: 3,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    name: "Satisfactory (2)",
    description: "Meets basic expectations with adequate quality",
    points: 2,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  {
    name: "Needs Improvement (1)",
    description: "Below expectations, requires significant improvement",
    points: 1,
    color: "bg-red-100 text-red-800 border-red-200"
  }
];

async function getOrCreateCourse(courseTitleOrId?: string) {
  let course;

  // If provided, try to find by ID first
  if (courseTitleOrId) {
    course = await prisma.course.findUnique({
      where: { id: courseTitleOrId },
    });
  }

  // If not found by ID, try by title
  if (!course && courseTitleOrId) {
    course = await prisma.course.findFirst({
      where: { title: courseTitleOrId },
    });
  }

  // If still not found, use default title
  if (!course) {
    const defaultTitle = courseTitleOrId || 'Web Design Fundamentals';
    course = await prisma.course.findFirst({
      where: { title: defaultTitle },
    });
  }

  // If not found, create it
  if (!course) {
    const title = courseTitleOrId || 'Web Design Fundamentals';
    course = await prisma.course.create({
      data: {
        title: title,
        description: 'A comprehensive course covering HTML, CSS, JavaScript, and modern web development practices.',
        isActive: true,
      },
    });
    console.log(`✅ Created course: ${course.title} (ID: ${course.id})`);
  } else {
    console.log(`✅ Using existing course: ${course.title} (ID: ${course.id})`);
  }

  return course;
}

async function getOrCreateRubricLevel(level: RubricLevel) {
  let rubricLevel = await prisma.rubricLevel.findFirst({
    where: {
      name: level.name,
      points: level.points,
    },
  });

  if (!rubricLevel) {
    rubricLevel = await prisma.rubricLevel.create({
      data: {
        name: level.name,
        description: level.description,
        points: level.points,
        color: level.color,
      },
    });
  }

  return rubricLevel;
}

async function getOrCreateRubricCriteria(criteria: RubricCriteria) {
  let rubricCriteria = await prisma.rubricCriteria.findFirst({
    where: {
      name: criteria.name,
      weight: criteria.weight,
    },
  });

  if (!rubricCriteria) {
    rubricCriteria = await prisma.rubricCriteria.create({
      data: {
        name: criteria.name,
        description: criteria.description,
        weight: criteria.weight,
      },
    });
  }

  return rubricCriteria;
}

async function createRubricWithMappings(
  rubricData: {
    name: string;
    description: string;
    totalPoints: number;
    criteria: RubricCriteria[];
    levels: RubricLevel[];
  }
) {
  // Create the rubric
  const rubric = await prisma.rubric.create({
    data: {
      name: rubricData.name,
      description: rubricData.description,
      totalPoints: rubricData.totalPoints,
    },
  });

  // Create or get rubric levels and create mappings
  for (const levelData of rubricData.levels) {
    const level = await getOrCreateRubricLevel(levelData);
    await prisma.rubricLevelMapping.upsert({
      where: {
        rubricId_levelId: {
          rubricId: rubric.id,
          levelId: level.id,
        },
      },
      create: {
        rubricId: rubric.id,
        levelId: level.id,
      },
      update: {},
    });
  }

  // Create or get rubric criteria and create mappings
  for (const criteriaData of rubricData.criteria) {
    const criteria = await getOrCreateRubricCriteria(criteriaData);
    await prisma.rubricCriteriaMapping.upsert({
      where: {
        rubricId_criteriaId: {
          rubricId: rubric.id,
          criteriaId: criteria.id,
        },
      },
      create: {
        rubricId: rubric.id,
        criteriaId: criteria.id,
      },
      update: {},
    });
  }

  return rubric;
}

async function importLessons(courseTitleOrId?: string) {
  try {
    console.log('🚀 Starting lesson import...\n');

    // Get or create course
    const course = await getOrCreateCourse(courseTitleOrId);
    console.log('');

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let totalExercises = 0;

    // Process each lesson
    for (const lessonData of lessons as LessonData[]) {
      // Check if lesson with this number already exists
      const existingLesson = await prisma.lesson.findUnique({
        where: { number: lessonData.number },
        include: { exercises: true },
      });

      let lesson;
      let exercisesCreated = 0;

      if (existingLesson) {
        lesson = existingLesson;
        // Update existing lesson if needed
        if (existingLesson.courseId !== course.id) {
          lesson = await prisma.lesson.update({
            where: { id: existingLesson.id },
            data: {
              title: lessonData.title,
              description: lessonData.description || null,
              duration: lessonData.duration || null,
              courseId: course.id,
            },
          });
          updatedCount++;
          console.log(`📝 Updated lesson ${lessonData.number}: ${lessonData.title}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped lesson ${lessonData.number}: ${lessonData.title} (already exists)`);
        }

        // Check if exercises need to be created
        const existingExerciseTitles = new Set(existingLesson.exercises.map(e => e.title));
        for (const exerciseData of lessonData.exercises) {
          if (!existingExerciseTitles.has(exerciseData.title)) {
            // Create rubric with mappings
            const rubric = await createRubricWithMappings({
              name: exerciseData.rubric.name,
              description: exerciseData.rubric.description,
              totalPoints: exerciseData.rubric.totalPoints,
              criteria: exerciseData.rubric.criteria,
              levels: exerciseData.rubric.levels,
            });

            // Create exercise
            await prisma.exercise.create({
              data: {
                title: exerciseData.title,
                description: exerciseData.description || null,
                maxPoints: exerciseData.maxPoints,
                lessonId: lesson.id,
                rubricId: rubric.id,
              },
            });
            exercisesCreated++;
            totalExercises++;
          }
        }
      } else {
        // Create new lesson
        lesson = await prisma.lesson.create({
          data: {
            number: lessonData.number,
            title: lessonData.title,
            description: lessonData.description || null,
            duration: lessonData.duration || null,
            courseId: course.id,
          },
        });
        createdCount++;
        console.log(`✅ Created lesson ${lessonData.number}: ${lessonData.title}`);

        // Process exercises for this lesson
        for (const exerciseData of lessonData.exercises) {
          // Create rubric with mappings
          const rubric = await createRubricWithMappings({
            name: exerciseData.rubric.name,
            description: exerciseData.rubric.description,
            totalPoints: exerciseData.rubric.totalPoints,
            criteria: exerciseData.rubric.criteria,
            levels: exerciseData.rubric.levels,
          });

          // Create exercise
          await prisma.exercise.create({
            data: {
              title: exerciseData.title,
              description: exerciseData.description || null,
              maxPoints: exerciseData.maxPoints,
              lessonId: lesson.id,
              rubricId: rubric.id,
            },
          });
          exercisesCreated++;
          totalExercises++;
        }
      }

      if (exercisesCreated > 0) {
        console.log(`   └─ Created ${exercisesCreated} exercise(s)`);
      }
    }

    // Import quiz questions
    let quizQuestionsCreated = 0;
    let quizQuestionsSkipped = 0;

    console.log('\n📝 Importing quiz questions...\n');

    for (const lessonData of lessons as LessonData[]) {
      const quizQuestions = quizQuestionsByLessonNumber[lessonData.number];
      
      if (!quizQuestions || quizQuestions.length === 0) {
        continue;
      }

      // Find the lesson in database
      const dbLesson = await prisma.lesson.findUnique({
        where: { number: lessonData.number },
        include: { quizQuestions: true },
      });

      if (!dbLesson) {
        console.log(`⚠️  Lesson ${lessonData.number} not found, skipping quiz questions`);
        continue;
      }

      // Check existing questions
      const existingQuestionTexts = new Set(dbLesson.quizQuestions.map(q => q.question));

      for (let i = 0; i < quizQuestions.length; i++) {
        const quizQuestion = quizQuestions[i];
        
        // Skip if question already exists
        if (existingQuestionTexts.has(quizQuestion.question)) {
          quizQuestionsSkipped++;
          continue;
        }

        // Create quiz question
        await prisma.quizQuestion.create({
          data: {
            lessonId: dbLesson.id,
            question: quizQuestion.question,
            options: quizQuestion.options,
            correctAnswer: quizQuestion.correctAnswer,
            explanation: quizQuestion.explanation || null,
            order: i,
          },
        });
        quizQuestionsCreated++;
      }

      if (quizQuestions.length > 0) {
        console.log(`✅ Imported ${quizQuestions.length} quiz question(s) for lesson ${lessonData.number}`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Created: ${createdCount} lessons`);
    console.log(`   📝 Updated: ${updatedCount} lessons`);
    console.log(`   ⏭️  Skipped: ${skippedCount} lessons`);
    console.log(`   📚 Total exercises: ${totalExercises}`);
    console.log(`   ❓ Quiz questions created: ${quizQuestionsCreated}`);
    console.log(`   ⏭️  Quiz questions skipped: ${quizQuestionsSkipped}`);
    console.log(`\n🎉 Lesson import completed successfully!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Assign instructors to the course in /admin/courses`);
    console.log(`   2. Instructors can now manage lessons in /instructor/courses`);

  } catch (error) {
    console.error('❌ Error importing lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
// Usage: tsx scripts/import-lessons.ts [course-title-or-id]
const courseArg = process.argv[2];
importLessons(courseArg)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

