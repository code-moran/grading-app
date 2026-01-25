/**
 * Cleanup script to remove orphaned lessons and exercises not linked to valid courses
 * Run with: npx tsx scripts/cleanup-orphaned-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphanedData() {
  console.log('Starting cleanup of orphaned lessons and exercises...\n');

  try {
    // Step 1: Find all courses
    const courses = await prisma.course.findMany({
      select: { id: true },
    });
    const validCourseIds = new Set(courses.map((c) => c.id));
    console.log(`Found ${validCourseIds.size} valid courses`);

    // Step 2: Find lessons with invalid courseId
    const allLessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        courseId: true,
        number: true,
      },
    });

    const orphanedLessons = allLessons.filter(
      (lesson) => !validCourseIds.has(lesson.courseId)
    );

    console.log(`\nFound ${orphanedLessons.length} orphaned lessons:`);
    orphanedLessons.forEach((lesson) => {
      console.log(`  - Lesson ${lesson.number}: ${lesson.title} (courseId: ${lesson.courseId})`);
    });

    if (orphanedLessons.length > 0) {
      // Step 3: Find exercises linked to orphaned lessons
      const orphanedLessonIds = orphanedLessons.map((l) => l.id);
      const orphanedExercises = await prisma.exercise.findMany({
        where: {
          lessonId: {
            in: orphanedLessonIds,
          },
        },
        select: {
          id: true,
          title: true,
          lessonId: true,
          _count: {
            select: {
              grades: true,
              exerciseSubmissions: true,
            },
          },
        },
      });

      console.log(`\nFound ${orphanedExercises.length} exercises linked to orphaned lessons:`);
      orphanedExercises.forEach((exercise) => {
        console.log(
          `  - ${exercise.title} (${exercise._count.grades} grades, ${exercise._count.exerciseSubmissions} submissions)`
        );
      });

      // Step 4: Check for dependent data
      const exercisesWithGrades = orphanedExercises.filter(
        (e) => e._count.grades > 0 || e._count.exerciseSubmissions > 0
      );

      if (exercisesWithGrades.length > 0) {
        console.log(
          `\n⚠️  WARNING: ${exercisesWithGrades.length} orphaned exercises have grades or submissions.`
        );
        console.log('These will be deleted due to CASCADE constraints.');
        console.log('Consider assigning these lessons to a course first.\n');
      }

      // Step 5: Ask for confirmation (in production, add --force flag)
      const shouldDelete = process.argv.includes('--force');
      
      if (!shouldDelete) {
        console.log('\n⚠️  DRY RUN MODE - No data will be deleted.');
        console.log('To actually delete, run with --force flag:');
        console.log('  npx tsx scripts/cleanup-orphaned-data.ts --force\n');
        return;
      }

      // Step 6: Delete orphaned exercises (will cascade delete grades/submissions)
      console.log('\nDeleting orphaned exercises...');
      const deletedExercises = await prisma.exercise.deleteMany({
        where: {
          lessonId: {
            in: orphanedLessonIds,
          },
        },
      });
      console.log(`Deleted ${deletedExercises.count} exercises`);

      // Step 7: Delete orphaned lessons (will cascade delete quiz attempts, quiz questions)
      console.log('Deleting orphaned lessons...');
      const deletedLessons = await prisma.lesson.deleteMany({
        where: {
          id: {
            in: orphanedLessonIds,
          },
        },
      });
      console.log(`Deleted ${deletedLessons.count} lessons`);

      console.log('\n✅ Cleanup completed successfully!');
    } else {
      console.log('\n✅ No orphaned lessons found. Database is clean!');
    }

    // Step 8: Check for orphaned lesson notes and PDF resources
    const orphanedLessonNotes = await prisma.lessonNote.findMany({
      where: {
        lessonId: {
          notIn: allLessons.map((l) => l.id),
        },
      },
    });

    if (orphanedLessonNotes.length > 0) {
      console.log(`\nFound ${orphanedLessonNotes.length} orphaned lesson notes`);
      if (process.argv.includes('--force')) {
        await prisma.lessonNote.deleteMany({
          where: {
            lessonId: {
              notIn: allLessons.map((l) => l.id),
            },
          },
        });
        console.log('Deleted orphaned lesson notes');
      }
    }

    const orphanedPDFResources = await prisma.pDFResource.findMany({
      where: {
        lessonId: {
          not: null,
          notIn: allLessons.map((l) => l.id),
        },
      },
    });

    if (orphanedPDFResources.length > 0) {
      console.log(`\nFound ${orphanedPDFResources.length} orphaned PDF resources`);
      if (process.argv.includes('--force')) {
        await prisma.pDFResource.updateMany({
          where: {
            lessonId: {
              not: null,
              notIn: allLessons.map((l) => l.id),
            },
          },
          data: {
            lessonId: null, // Set to null instead of deleting
          },
        });
        console.log('Cleared lessonId from orphaned PDF resources');
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedData()
  .then(() => {
    console.log('\nScript completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
