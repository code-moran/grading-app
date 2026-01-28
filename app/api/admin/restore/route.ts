import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    exportedBy: string;
    exportedByEmail: string;
    recordCounts: Record<string, number>;
  };
  data: {
    users?: any[];
    students?: any[];
    instructors?: any[];
    courses?: any[];
    lessons?: any[];
    exercises?: any[];
    grades?: any[];
    gradeCriteria?: any[];
    quizQuestions?: any[];
    quizAttempts?: any[];
    rubrics?: any[];
    rubricCriteria?: any[];
    rubricLevels?: any[];
    rubricCriteriaMappings?: any[];
    rubricLevelMappings?: any[];
    cohorts?: any[];
    courseSubscriptions?: any[];
    courseInstructors?: any[];
    exerciseSubmissions?: any[];
    lessonNotes?: any[];
    pdfResources?: any[];
    unitStandards?: any[];
    competencyUnits?: any[];
    assessorAccreditations?: any[];
    assessmentAuditLogs?: any[];
    [key: string]: any[] | undefined;
  };
}

// POST /api/admin/restore - Restore data from backup
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { backupData, options } = body;

    if (!backupData || !backupData.metadata || !backupData.data) {
      return NextResponse.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      );
    }

    const {
      clearExisting = false,
      skipUsers = false,
      skipGrades = false,
      skipQuizAttempts = false,
    } = options || {};

    // Validate backup version
    if (backupData.metadata.version !== '1.0.0') {
      return NextResponse.json(
        { error: `Unsupported backup version: ${backupData.metadata.version}` },
        { status: 400 }
      );
    }

    // Use transaction for atomic restore
    const result = await prisma.$transaction(async (tx) => {
      const restoreStats: Record<string, number> = {};

      try {
        // Clear existing data if requested
        if (clearExisting) {
          // Delete in reverse order of dependencies
          await tx.assessmentAuditLog.deleteMany({});
          await tx.gradeCriteria.deleteMany({});
          await tx.exerciseSubmission.deleteMany({});
          await tx.grade.deleteMany({});
          await tx.quizAttempt.deleteMany({});
          await tx.quizQuestion.deleteMany({});
          await tx.exercise.deleteMany({});
          await tx.competencyUnit.deleteMany({});
          await tx.lessonNote.deleteMany({});
          await tx.lesson.deleteMany({});
          await tx.courseSubscription.deleteMany({});
          await tx.courseInstructor.deleteMany({});
          await tx.course.deleteMany({});
          await tx.unitStandard.deleteMany({});
          await tx.rubricLevelMapping.deleteMany({});
          await tx.rubricCriteriaMapping.deleteMany({});
          await tx.rubricLevel.deleteMany({});
          await tx.rubricCriteria.deleteMany({});
          await tx.rubric.deleteMany({});
          await tx.pDFResource.deleteMany({});
          await tx.assessorAccreditation.deleteMany({});
          if (!skipUsers) {
            await tx.student.deleteMany({});
            await tx.instructor.deleteMany({});
            await tx.user.deleteMany({});
          }
          await tx.cohort.deleteMany({});
        }

        // ID mapping to track old IDs -> new IDs for foreign key remapping
        const idMaps: Record<string, Map<string, string>> = {
          cohorts: new Map(),
          users: new Map(),
          students: new Map(),
          instructors: new Map(),
          courses: new Map(),
          lessons: new Map(),
          exercises: new Map(),
          rubrics: new Map(),
          rubricCriteria: new Map(),
          rubricLevels: new Map(),
          unitStandards: new Map(),
          competencyUnits: new Map(),
        };

        // Restore data in order of dependencies
        const restoreOperations: Array<{
          key: string;
          restoreFn: () => Promise<void>;
        }> = [];

        // Helper function to create restore operation with ID mapping
        const createRestoreOp = <T extends { create: (args: any) => Promise<any>; findUnique: (args: any) => Promise<any> }>(
          key: string,
          model: T,
          skip: boolean,
          idMapKey?: string, // Key to store ID mappings (e.g., 'cohorts', 'users')
          uniqueField?: string // Field to check for uniqueness (e.g., 'email', 'registrationNumber', 'name')
        ) => {
          if (skip || !backupData.data[key] || backupData.data[key]!.length === 0) {
            return;
          }

          const records = backupData.data[key]!;
          const recordsToInsert = records.map((record: any) => {
            const { id: oldId, ...rest } = record;
            return { oldId, data: rest };
          });

          if (recordsToInsert.length > 0) {
            restoreOperations.push({
              key,
              restoreFn: async () => {
                // Insert records one by one to capture new IDs
                const insertedRecords = [];
                for (const { oldId, data } of recordsToInsert) {
                  try {
                    // Check if record already exists before creating
                    let existing = null;
                    if (uniqueField && data[uniqueField]) {
                      try {
                        existing = await model.findUnique({
                          where: { [uniqueField]: data[uniqueField] },
                        });
                      } catch (findError) {
                        // Ignore find errors, proceed with create
                      }
                    }
                    
                    if (existing) {
                      // Record exists, use it for ID mapping
                      if (idMapKey && oldId) {
                        idMaps[idMapKey].set(oldId, existing.id);
                      }
                    } else {
                      // Create new record
                      const created = await model.create({
                        data,
                      });
                      insertedRecords.push(created);
                      // Store ID mapping if idMapKey is provided
                      if (idMapKey && oldId) {
                        idMaps[idMapKey].set(oldId, created.id);
                      }
                    }
                  } catch (error: any) {
                    // Only catch duplicate errors, let other errors propagate
                    if (error.code === 'P2002') {
                      // Unique constraint violation - try to find existing record
                      let existing = null;
                      if (uniqueField && data[uniqueField]) {
                        try {
                          existing = await model.findUnique({
                            where: { [uniqueField]: data[uniqueField] },
                          });
                        } catch (findError) {
                          // Ignore find errors
                        }
                      }
                      
                      if (existing && idMapKey && oldId) {
                        idMaps[idMapKey].set(oldId, existing.id);
                      }
                      // Continue to next record
                    } else {
                      // Re-throw non-duplicate errors to abort transaction
                      throw error;
                    }
                  }
                }
                restoreStats[key] = insertedRecords.length;
              },
            });
          }
        };

        // Helper function to remap foreign keys in records
        const remapForeignKeys = (
          records: any[],
          foreignKeyMappings: Record<string, string> // e.g., { cohortId: 'cohorts', userId: 'users' }
        ) => {
          return records.map((record: any) => {
            const { id: oldId, ...rest } = record;
            const remapped: any = { oldId, data: { ...rest } };
            
            // Remap foreign keys
            for (const [fkField, mapKey] of Object.entries(foreignKeyMappings)) {
              if (remapped.data[fkField] && idMaps[mapKey]) {
                const newId = idMaps[mapKey].get(remapped.data[fkField]);
                if (newId) {
                  remapped.data[fkField] = newId;
                } else {
                  // If cohort doesn't exist, set to null
                  remapped.data[fkField] = null;
                }
              }
            }
            
            return remapped;
          });
        };

        // Create restore operations in order with ID mapping
        createRestoreOp('users', tx.user, skipUsers, 'users', 'email');
        createRestoreOp('cohorts', tx.cohort, false, 'cohorts', 'name');
        
        // Students need cohortId remapping
        if (!skipUsers && backupData.data.students && backupData.data.students.length > 0) {
          const studentsWithRemappedCohorts = remapForeignKeys(backupData.data.students, {
            cohortId: 'cohorts',
            userId: 'users',
          });
          
          if (studentsWithRemappedCohorts.length > 0) {
            restoreOperations.push({
              key: 'students',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { oldId, data } of studentsWithRemappedCohorts) {
                  try {
                    // Check if student already exists BEFORE creating
                    let existing = null;
                    if (data.registrationNumber) {
                      try {
                        existing = await tx.student.findUnique({
                          where: { registrationNumber: data.registrationNumber },
                        });
                      } catch (findError) {
                        // Ignore find errors, proceed with create
                      }
                    }
                    
                    if (existing) {
                      // Student exists, use it for ID mapping
                      if (oldId) {
                        idMaps.students.set(oldId, existing.id);
                      }
                    } else {
                      // Create new student
                      const created = await tx.student.create({ data });
                      insertedRecords.push(created);
                      if (oldId) {
                        idMaps.students.set(oldId, created.id);
                      }
                    }
                  } catch (error: any) {
                    // Only catch duplicate errors as a fallback
                    if (error.code === 'P2002') {
                      // Try to find existing by registrationNumber
                      try {
                        const existing = await tx.student.findUnique({
                          where: { registrationNumber: data.registrationNumber },
                        });
                        if (existing && oldId) {
                          idMaps.students.set(oldId, existing.id);
                        }
                      } catch (findError) {
                        // Ignore find errors
                      }
                      // Continue to next record
                    } else {
                      // Re-throw non-duplicate errors to abort transaction
                      throw error;
                    }
                  }
                }
                restoreStats.students = insertedRecords.length;
              },
            });
          }
        }
        
        createRestoreOp('instructors', tx.instructor, skipUsers, 'instructors', 'userId');
        // AssessorAccreditations need instructorId remapping
        if (!skipUsers && backupData.data.assessorAccreditations && backupData.data.assessorAccreditations.length > 0) {
          const accreditationsWithRemapping = remapForeignKeys(backupData.data.assessorAccreditations, {
            instructorId: 'instructors',
          });
          
          if (accreditationsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'assessorAccreditations',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of accreditationsWithRemapping) {
                  try {
                    await tx.assessorAccreditation.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.assessorAccreditations = insertedRecords.length;
              },
            });
          }
        }
        
        createRestoreOp('unitStandards', tx.unitStandard, false, 'unitStandards');
        
        // CompetencyUnits need unitStandardId remapping
        if (backupData.data.competencyUnits && backupData.data.competencyUnits.length > 0) {
          const competencyUnitsWithRemapping = remapForeignKeys(backupData.data.competencyUnits, {
            unitStandardId: 'unitStandards',
          });
          
          if (competencyUnitsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'competencyUnits',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { oldId, data } of competencyUnitsWithRemapping) {
                  try {
                    const created = await tx.competencyUnit.create({ data });
                    insertedRecords.push(created);
                    if (oldId) {
                      idMaps.competencyUnits.set(oldId, created.id);
                    }
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.competencyUnits = insertedRecords.length;
              },
            });
          }
        }
        // Courses need unitStandardId remapping
        if (backupData.data.courses && backupData.data.courses.length > 0) {
          const coursesWithRemapping = remapForeignKeys(backupData.data.courses, {
            unitStandardId: 'unitStandards',
          });
          
          if (coursesWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'courses',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { oldId, data } of coursesWithRemapping) {
                  try {
                    const created = await tx.course.create({ data });
                    insertedRecords.push(created);
                    if (oldId) {
                      idMaps.courses.set(oldId, created.id);
                    }
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.courses = insertedRecords.length;
              },
            });
          }
        }
        
        // CourseInstructors need remapping
        if (backupData.data.courseInstructors && backupData.data.courseInstructors.length > 0) {
          const courseInstructorsWithRemapping = remapForeignKeys(backupData.data.courseInstructors, {
            courseId: 'courses',
            instructorId: 'instructors',
          });
          
          if (courseInstructorsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'courseInstructors',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of courseInstructorsWithRemapping) {
                  try {
                    await tx.courseInstructor.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.courseInstructors = insertedRecords.length;
              },
            });
          }
        }
        
        // Lessons need courseId remapping
        if (backupData.data.lessons && backupData.data.lessons.length > 0) {
          const lessonsWithRemapping = remapForeignKeys(backupData.data.lessons, {
            courseId: 'courses',
          });
          
          if (lessonsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'lessons',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { oldId, data } of lessonsWithRemapping) {
                  try {
                    // Check if lesson already exists BEFORE creating
                    let existing = null;
                    if (data.number !== undefined && data.courseId) {
                      try {
                        existing = await tx.lesson.findFirst({
                          where: {
                            number: data.number,
                            courseId: data.courseId,
                          },
                        });
                      } catch (findError) {
                        // Ignore find errors, proceed with create
                      }
                    }
                    
                    if (existing) {
                      // Lesson exists, use it for ID mapping
                      if (oldId) {
                        idMaps.lessons.set(oldId, existing.id);
                      }
                    } else {
                      // Create new lesson
                      const created = await tx.lesson.create({ data });
                      insertedRecords.push(created);
                      if (oldId) {
                        idMaps.lessons.set(oldId, created.id);
                      }
                    }
                  } catch (error: any) {
                    // Only catch duplicate errors as a fallback
                    if (error.code === 'P2002') {
                      // Try to find existing by number and courseId
                      try {
                        const existing = await tx.lesson.findFirst({
                          where: {
                            number: data.number,
                            courseId: data.courseId,
                          },
                        });
                        if (existing && oldId) {
                          idMaps.lessons.set(oldId, existing.id);
                        }
                      } catch (findError) {
                        // Ignore find errors
                      }
                      // Continue to next record
                    } else {
                      // Re-throw non-duplicate errors to abort transaction
                      throw error;
                    }
                  }
                }
                restoreStats.lessons = insertedRecords.length;
              },
            });
          }
        }
        
        // Exercises need lessonId and rubricId remapping
        if (backupData.data.exercises && backupData.data.exercises.length > 0) {
          const exercisesWithRemapping = remapForeignKeys(backupData.data.exercises, {
            lessonId: 'lessons',
            rubricId: 'rubrics',
            competencyUnitId: 'competencyUnits',
          });
          
          if (exercisesWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'exercises',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { oldId, data } of exercisesWithRemapping) {
                  try {
                    const created = await tx.exercise.create({ data });
                    insertedRecords.push(created);
                    if (oldId) {
                      idMaps.exercises.set(oldId, created.id);
                    }
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.exercises = insertedRecords.length;
              },
            });
          }
        }
        createRestoreOp('rubrics', tx.rubric, false, 'rubrics');
        createRestoreOp('rubricCriteria', tx.rubricCriteria, false, 'rubricCriteria');
        createRestoreOp('rubricLevels', tx.rubricLevel, false, 'rubricLevels');
        
        // Rubric mappings need remapping
        if (backupData.data.rubricCriteriaMappings && backupData.data.rubricCriteriaMappings.length > 0) {
          const rubricCriteriaMappingsWithRemapping = remapForeignKeys(backupData.data.rubricCriteriaMappings, {
            rubricId: 'rubrics',
            criteriaId: 'rubricCriteria',
          });
          
          if (rubricCriteriaMappingsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'rubricCriteriaMappings',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of rubricCriteriaMappingsWithRemapping) {
                  try {
                    await tx.rubricCriteriaMapping.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.rubricCriteriaMappings = insertedRecords.length;
              },
            });
          }
        }
        
        if (backupData.data.rubricLevelMappings && backupData.data.rubricLevelMappings.length > 0) {
          const rubricLevelMappingsWithRemapping = remapForeignKeys(backupData.data.rubricLevelMappings, {
            rubricId: 'rubrics',
            levelId: 'rubricLevels',
          });
          
          if (rubricLevelMappingsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'rubricLevelMappings',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of rubricLevelMappingsWithRemapping) {
                  try {
                    await tx.rubricLevelMapping.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.rubricLevelMappings = insertedRecords.length;
              },
            });
          }
        }
        
        // QuizQuestions need lessonId remapping
        if (backupData.data.quizQuestions && backupData.data.quizQuestions.length > 0) {
          const quizQuestionsWithRemapping = remapForeignKeys(backupData.data.quizQuestions, {
            lessonId: 'lessons',
          });
          
          if (quizQuestionsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'quizQuestions',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of quizQuestionsWithRemapping) {
                  try {
                    await tx.quizQuestion.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.quizQuestions = insertedRecords.length;
              },
            });
          }
        }
        
        // LessonNotes need lessonId remapping
        if (backupData.data.lessonNotes && backupData.data.lessonNotes.length > 0) {
          const lessonNotesWithRemapping = remapForeignKeys(backupData.data.lessonNotes, {
            lessonId: 'lessons',
          });
          
          if (lessonNotesWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'lessonNotes',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of lessonNotesWithRemapping) {
                  try {
                    await tx.lessonNote.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.lessonNotes = insertedRecords.length;
              },
            });
          }
        }
        
        // PDFResources need lessonId remapping
        if (backupData.data.pdfResources && backupData.data.pdfResources.length > 0) {
          const pdfResourcesWithRemapping = remapForeignKeys(backupData.data.pdfResources, {
            lessonId: 'lessons',
          });
          
          if (pdfResourcesWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'pdfResources',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of pdfResourcesWithRemapping) {
                  try {
                    await tx.pDFResource.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.pdfResources = insertedRecords.length;
              },
            });
          }
        }
        
        // CourseSubscriptions need remapping
        if (backupData.data.courseSubscriptions && backupData.data.courseSubscriptions.length > 0) {
          const courseSubscriptionsWithRemapping = remapForeignKeys(backupData.data.courseSubscriptions, {
            userId: 'users',
            studentId: 'students',
            courseId: 'courses',
          });
          
          if (courseSubscriptionsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'courseSubscriptions',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of courseSubscriptionsWithRemapping) {
                  try {
                    await tx.courseSubscription.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.courseSubscriptions = insertedRecords.length;
              },
            });
          }
        }
        
        // ExerciseSubmissions need remapping
        if (backupData.data.exerciseSubmissions && backupData.data.exerciseSubmissions.length > 0) {
          const exerciseSubmissionsWithRemapping = remapForeignKeys(backupData.data.exerciseSubmissions, {
            studentId: 'students',
            exerciseId: 'exercises',
          });
          
          if (exerciseSubmissionsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'exerciseSubmissions',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of exerciseSubmissionsWithRemapping) {
                  try {
                    await tx.exerciseSubmission.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.exerciseSubmissions = insertedRecords.length;
              },
            });
          }
        }
        
        // Grades need remapping
        if (!skipGrades && backupData.data.grades && backupData.data.grades.length > 0) {
          const gradesWithRemapping = remapForeignKeys(backupData.data.grades, {
            studentId: 'students',
            lessonId: 'lessons',
            exerciseId: 'exercises',
            assessorId: 'instructors',
            verifiedBy: 'instructors',
            moderatedBy: 'instructors',
          });
          
          if (gradesWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'grades',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of gradesWithRemapping) {
                  try {
                    await tx.grade.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.grades = insertedRecords.length;
              },
            });
          }
        }
        
        // GradeCriteria need remapping
        if (!skipGrades && backupData.data.gradeCriteria && backupData.data.gradeCriteria.length > 0) {
          const gradeCriteriaWithRemapping = remapForeignKeys(backupData.data.gradeCriteria, {
            gradeId: 'grades',
            criteriaId: 'rubricCriteria',
            levelId: 'rubricLevels',
          });
          
          if (gradeCriteriaWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'gradeCriteria',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of gradeCriteriaWithRemapping) {
                  try {
                    await tx.gradeCriteria.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.gradeCriteria = insertedRecords.length;
              },
            });
          }
        }
        
        // QuizAttempts need remapping
        if (!skipQuizAttempts && backupData.data.quizAttempts && backupData.data.quizAttempts.length > 0) {
          const quizAttemptsWithRemapping = remapForeignKeys(backupData.data.quizAttempts, {
            studentId: 'students',
            lessonId: 'lessons',
          });
          
          if (quizAttemptsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'quizAttempts',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of quizAttemptsWithRemapping) {
                  try {
                    await tx.quizAttempt.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.quizAttempts = insertedRecords.length;
              },
            });
          }
        }
        
        // AssessmentAuditLogs need remapping
        if (!skipGrades && backupData.data.assessmentAuditLogs && backupData.data.assessmentAuditLogs.length > 0) {
          const auditLogsWithRemapping = remapForeignKeys(backupData.data.assessmentAuditLogs, {
            gradeId: 'grades',
          });
          
          if (auditLogsWithRemapping.length > 0) {
            restoreOperations.push({
              key: 'assessmentAuditLogs',
              restoreFn: async () => {
                const insertedRecords = [];
                for (const { data } of auditLogsWithRemapping) {
                  try {
                    await tx.assessmentAuditLog.create({ data });
                    insertedRecords.push(data);
                  } catch (error: any) {
                    if (error.code !== 'P2002') {
                      throw error;
                    }
                  }
                }
                restoreStats.assessmentAuditLogs = insertedRecords.length;
              },
            });
          }
        }

        // Execute all restore operations
        for (const op of restoreOperations) {
          await op.restoreFn();
        }

        return {
          success: true,
          stats: restoreStats,
          metadata: backupData.metadata,
        };
      } catch (error: any) {
        console.error('Error during restore:', error);
        throw error;
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      stats: result.stats,
      restoredFrom: result.metadata,
    });
  } catch (error: any) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      {
        error: 'Failed to restore backup',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

