import { PrismaClient } from '@prisma/client';
import { lessons } from '../lib/lessons';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.gradeCriteria.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.rubricCriteriaMapping.deleteMany();
  await prisma.rubricLevelMapping.deleteMany();
  await prisma.rubricCriteria.deleteMany();
  await prisma.rubricLevel.deleteMany();
  await prisma.rubric.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create a default course for seeding lessons
  const defaultCourse = await prisma.course.upsert({
    where: { id: 'seed-default-course' },
    update: {},
    create: {
      id: 'seed-default-course',
      title: 'Default Course (Seed)',
      description: 'Default course created for seeding lessons',
    },
  });

  // Store created levels and criteria for reuse
  const createdLevels = new Map<string, any>();
  const createdCriteria = new Map<string, any>();

  // Process each lesson
  for (const lessonData of lessons) {
    console.log(`📚 Creating lesson: ${lessonData.title}`);

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        id: lessonData.id,
        courseId: defaultCourse.id,
        number: lessonData.number,
        title: lessonData.title,
        description: lessonData.description,
        duration: lessonData.duration
      }
    });

    // Process each exercise in the lesson
    for (const exerciseData of lessonData.exercises) {
      console.log(`  📝 Creating exercise: ${exerciseData.title}`);

      // Create rubric
      const rubric = await prisma.rubric.create({
        data: {
          id: exerciseData.rubric.id,
          name: exerciseData.rubric.name,
          description: exerciseData.rubric.description,
          totalPoints: exerciseData.rubric.totalPoints
        }
      });

      // Create rubric levels if they don't exist
      for (const levelData of exerciseData.rubric.levels) {
        if (!createdLevels.has(levelData.id)) {
          const level = await prisma.rubricLevel.create({
            data: {
              id: levelData.id,
              name: levelData.name,
              description: levelData.description,
              points: levelData.points,
              color: levelData.color
            }
          });
          createdLevels.set(levelData.id, level);
        }

        // Create rubric level mapping
        await prisma.rubricLevelMapping.create({
          data: {
            rubricId: rubric.id,
            levelId: levelData.id
          }
        });
      }

      // Create rubric criteria if they don't exist
      for (const criteriaData of exerciseData.rubric.criteria) {
        if (!createdCriteria.has(criteriaData.id)) {
          const criteria = await prisma.rubricCriteria.create({
            data: {
              id: criteriaData.id,
              name: criteriaData.name,
              description: criteriaData.description,
              weight: criteriaData.weight
            }
          });
          createdCriteria.set(criteriaData.id, criteria);
        }

        // Create rubric criteria mapping
        await prisma.rubricCriteriaMapping.create({
          data: {
            rubricId: rubric.id,
            criteriaId: criteriaData.id
          }
        });
      }

      // Create exercise
      await prisma.exercise.create({
        data: {
          id: exerciseData.id,
          lessonId: lesson.id,
          title: exerciseData.title,
          description: exerciseData.description,
          maxPoints: exerciseData.maxPoints,
          rubricId: rubric.id
        }
      });
    }
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });