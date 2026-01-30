import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface LessonData {
  lesson: any;
  exercises: any[];
  quizQuestions: any[];
  lessonNotes: any[];
  pdfResources: any[];
}

interface CourseData {
  course: any;
  lessons: LessonData[];
}

interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    exportedBy: string;
    exportedByEmail: string;
    recordCounts: Record<string, number>;
  };
  data: {
    // Nested course structure (primary)
    coursesNested?: CourseData[];
    // Flat structure (for backward compatibility)
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
    [key: string]: any[] | CourseData[] | undefined;
  };
}

interface RestoreOptions {
  clearExisting?: boolean;
  skipUsers?: boolean;
  skipGrades?: boolean;
  skipQuizAttempts?: boolean;
  restoreToCourseId?: string; // Destination course ID
  sourceCourseId?: string; // Source course ID from backup
  // Lesson component skip options
  skipExercises?: boolean;
  skipQuizQuestions?: boolean;
  skipLessonNotes?: boolean;
  skipPdfResources?: boolean;
}

interface IdMaps {
  cohorts: Map<string, string>;
  users: Map<string, string>;
  students: Map<string, string>;
  instructors: Map<string, string>;
  courses: Map<string, string>;
  lessons: Map<string, string>;
  exercises: Map<string, string>;
  rubrics: Map<string, string>;
  rubricCriteria: Map<string, string>;
  rubricLevels: Map<string, string>;
  unitStandards: Map<string, string>;
  competencyUnits: Map<string, string>;
}

interface RestoreOperation {
  key: string;
  restoreFn: () => Promise<void>;
}

// Helper: Filter course-related data by source course ID
function filterCourseRelatedData(
  backupData: BackupData,
  sourceCourseId: string
): {
  lessons: any[];
  exercises: any[];
  quizQuestions: any[];
  lessonNotes: any[];
  pdfResources: any[];
  lessonIds: Set<string>;
} {
  const sourceCourseIds = new Set([sourceCourseId]);
  
  // Get all lessons for the source course
  const lessons = (backupData.data.lessons || []).filter(
    (lesson: any) => lesson.courseId && sourceCourseIds.has(lesson.courseId)
  );
  
  const lessonIds = new Set(lessons.map((l: any) => l.id).filter(Boolean));
  
  // Get all exercises for these lessons
  const exercises = (backupData.data.exercises || []).filter(
    (exercise: any) => exercise.lessonId && lessonIds.has(exercise.lessonId)
  );
  
  // Get all quiz questions for these lessons
  const quizQuestions = (backupData.data.quizQuestions || []).filter(
    (qq: any) => qq.lessonId && lessonIds.has(qq.lessonId)
  );
  
  // Get all lesson notes for these lessons
  const lessonNotes = (backupData.data.lessonNotes || []).filter(
    (ln: any) => ln.lessonId && lessonIds.has(ln.lessonId)
  );
  
  // Get all PDF resources for these lessons
  const pdfResources = (backupData.data.pdfResources || []).filter(
    (pdf: any) => pdf.lessonId && lessonIds.has(pdf.lessonId)
  );
  
  return {
    lessons,
    exercises,
    quizQuestions,
    lessonNotes,
    pdfResources,
    lessonIds,
  };
}

// Helper: Remap foreign keys in records
function remapForeignKeys(
  records: any[],
  foreignKeyMappings: Record<string, string>,
  idMaps: IdMaps
): Array<{ oldId: string | undefined; data: any }> {
  return records.map((record: any) => {
    const { id: oldId, ...rest } = record;
    const remapped: any = { oldId, data: { ...rest } };
    
    for (const [fkField, mapKey] of Object.entries(foreignKeyMappings)) {
      if (remapped.data[fkField]) {
        const map = idMaps[mapKey as keyof IdMaps];
        if (map) {
          const newId = map.get(remapped.data[fkField]);
          if (newId) {
            remapped.data[fkField] = newId;
          } else {
            remapped.data[fkField] = null;
          }
        } else {
          remapped.data[fkField] = null;
        }
      }
    }
    
    return remapped;
  });
}

// Helper: Create a simple restore operation
function createSimpleRestoreOp(
  key: string,
  model: { create: (args: any) => Promise<any>; findUnique?: (args: any) => Promise<any> },
  records: any[],
  skip: boolean,
  restoreStats: Record<string, number>,
  idMapKey?: keyof IdMaps,
  uniqueField?: string
): RestoreOperation | null {
  if (skip || !records || records.length === 0) {
    return null;
  }

  const recordsToInsert = records.map((record: any) => {
    const { id: oldId, ...rest } = record;
    return { oldId, data: rest };
  });

  if (recordsToInsert.length === 0) {
    return null;
  }

  return {
    key,
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { oldId, data } of recordsToInsert) {
        try {
          let existing = null;
          if (uniqueField && data[uniqueField] && model.findUnique) {
            try {
              existing = await model.findUnique({
                where: { [uniqueField]: data[uniqueField] },
              });
            } catch {
              // Ignore find errors
            }
          }
          
          if (existing) {
            if (idMapKey && oldId) {
              // Use existing record for ID mapping
            }
          } else {
            const created = await model.create({ data });
            insertedRecords.push(created);
            if (idMapKey && oldId) {
              // ID mapping will be handled by caller
            }
          }
        } catch (error: any) {
          if (error.code === 'P2002') {
            // Duplicate, try to find existing
            if (uniqueField && data[uniqueField] && model.findUnique) {
              try {
                const existing = await model.findUnique({
                  where: { [uniqueField]: data[uniqueField] },
                });
                if (existing && idMapKey && oldId) {
                  // ID mapping will be handled by caller
                }
              } catch {
                // Ignore
              }
            }
          } else {
            console.error(`Error creating ${key} record:`, {
              errorCode: error.code,
              errorMessage: error.message,
              data: JSON.stringify(data, null, 2),
            });
            throw error;
          }
        }
      }
      restoreStats[key] = insertedRecords.length;
    },
  };
}

// Helper: Restore users
function restoreUsers(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.users || backupData.data.users.length === 0) {
    return null;
  }

  return {
    key: 'users',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const user of backupData.data.users || []) {
        const { id: oldId, ...data } = user;
        try {
          let existing = null;
          if (data.email) {
            try {
              existing = await tx.user.findUnique({
                where: { email: data.email },
              });
            } catch {
              // Ignore
            }
          }
          
          if (existing) {
            if (oldId) {
              idMaps.users.set(oldId, existing.id);
            }
          } else {
            const created = await tx.user.create({ data });
            insertedRecords.push(created);
            if (oldId) {
              idMaps.users.set(oldId, created.id);
            }
          }
        } catch (error: any) {
          if (error.code === 'P2002') {
            if (data.email) {
              try {
                const existing = await tx.user.findUnique({
                  where: { email: data.email },
                });
                if (existing && oldId) {
                  idMaps.users.set(oldId, existing.id);
                }
              } catch {
                // Ignore
              }
            }
          } else {
            throw error;
          }
        }
      }
      restoreStats.users = insertedRecords.length;
    },
  };
}

// Helper: Restore cohorts
function restoreCohorts(
  backupData: BackupData,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (!backupData.data.cohorts || backupData.data.cohorts.length === 0) {
    return null;
  }

  return {
    key: 'cohorts',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const cohort of backupData.data.cohorts || []) {
        const { id: oldId, ...data } = cohort;
        try {
          let existing = null;
          if (data.name) {
            try {
              existing = await tx.cohort.findUnique({
                where: { name: data.name },
              });
            } catch {
              // Ignore
            }
          }
          
          if (existing) {
            if (oldId) {
              idMaps.cohorts.set(oldId, existing.id);
            }
          } else {
            const created = await tx.cohort.create({ data });
            insertedRecords.push(created);
            if (oldId) {
              idMaps.cohorts.set(oldId, created.id);
            }
          }
        } catch (error: any) {
          if (error.code === 'P2002') {
            if (data.name) {
              try {
                const existing = await tx.cohort.findUnique({
                  where: { name: data.name },
                });
                if (existing && oldId) {
                  idMaps.cohorts.set(oldId, existing.id);
                }
              } catch {
                // Ignore
              }
            }
          } else {
            throw error;
          }
        }
      }
      restoreStats.cohorts = insertedRecords.length;
    },
  };
}

// Helper: Restore students
function restoreStudents(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.students || backupData.data.students.length === 0) {
    return null;
  }

  const studentsWithRemapping = remapForeignKeys(
    backupData.data.students,
    { cohortId: 'cohorts', userId: 'users' },
    idMaps
  );

  const validStudents = studentsWithRemapping.filter(
    ({ data }) => data.registrationNumber
  );

  if (validStudents.length === 0) {
    return null;
  }

  return {
    key: 'students',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { oldId, data } of validStudents) {
        try {
          let existing = null;
          if (data.registrationNumber) {
            try {
              existing = await tx.student.findUnique({
                where: { registrationNumber: data.registrationNumber },
              });
            } catch {
              // Ignore
            }
          }
          
          if (existing) {
            if (oldId) {
              idMaps.students.set(oldId, existing.id);
            }
          } else {
            const created = await tx.student.create({ data });
            insertedRecords.push(created);
            if (oldId) {
              idMaps.students.set(oldId, created.id);
            }
          }
        } catch (error: any) {
          if (error.code === 'P2002') {
            if (data.registrationNumber) {
              try {
                const existing = await tx.student.findUnique({
                  where: { registrationNumber: data.registrationNumber },
                });
                if (existing && oldId) {
                  idMaps.students.set(oldId, existing.id);
                }
              } catch {
                // Ignore
              }
            }
          } else {
            throw error;
          }
        }
      }
      restoreStats.students = insertedRecords.length;
    },
  };
}

// Helper: Restore instructors
function restoreInstructors(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.instructors || backupData.data.instructors.length === 0) {
    return null;
  }

  const instructorsWithRemapping = remapForeignKeys(
    backupData.data.instructors,
    { userId: 'users', approvedBy: 'users' },
    idMaps
  );

  const validInstructors = instructorsWithRemapping.filter(
    ({ data }) => data.userId !== null
  );

  if (validInstructors.length === 0) {
    return null;
  }

  return {
    key: 'instructors',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { oldId, data } of validInstructors) {
        try {
          let existing = null;
          if (data.userId) {
            try {
              existing = await tx.instructor.findUnique({
                where: { userId: data.userId },
              });
            } catch {
              // Ignore
            }
          }
          
          if (existing) {
            if (oldId) {
              idMaps.instructors.set(oldId, existing.id);
            }
          } else {
            const created = await tx.instructor.create({ data });
            insertedRecords.push(created);
            if (oldId) {
              idMaps.instructors.set(oldId, created.id);
            }
          }
        } catch (error: any) {
          if (error.code === 'P2002') {
            if (data.userId) {
              try {
                const existing = await tx.instructor.findUnique({
                  where: { userId: data.userId },
                });
                if (existing && oldId) {
                  idMaps.instructors.set(oldId, existing.id);
                }
              } catch {
                // Ignore
              }
            }
          } else {
            throw error;
          }
        }
      }
      restoreStats.instructors = insertedRecords.length;
    },
  };
}

// Helper: Restore unit standards
function restoreUnitStandards(
  backupData: BackupData,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (!backupData.data.unitStandards || backupData.data.unitStandards.length === 0) {
    return null;
  }

  return {
    key: 'unitStandards',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const unitStandard of backupData.data.unitStandards || []) {
        const { id: oldId, ...data } = unitStandard;
        try {
          const created = await tx.unitStandard.create({ data });
          insertedRecords.push(created);
          if (oldId) {
            idMaps.unitStandards.set(oldId, created.id);
          }
        } catch (error: any) {
          if (error.code !== 'P2002') {
            throw error;
          }
        }
      }
      restoreStats.unitStandards = insertedRecords.length;
    },
  };
}

// Helper: Restore competency units
function restoreCompetencyUnits(
  backupData: BackupData,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (!backupData.data.competencyUnits || backupData.data.competencyUnits.length === 0) {
    return null;
  }

  const competencyUnitsWithRemapping = remapForeignKeys(
    backupData.data.competencyUnits,
    { unitStandardId: 'unitStandards' },
    idMaps
  );

  const validCompetencyUnits = competencyUnitsWithRemapping.filter(
    ({ data }) => data.unitStandardId !== null
  );

  if (validCompetencyUnits.length === 0) {
    return null;
  }

  return {
    key: 'competencyUnits',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { oldId, data } of validCompetencyUnits) {
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
  };
}

// Helper: Restore courses
function restoreCourses(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  const { restoreToCourseId, sourceCourseId } = options;

  // For course-specific restore, map all source course IDs to destination
  if (restoreToCourseId && sourceCourseId) {
    if (backupData.data.courses) {
      for (const course of backupData.data.courses) {
        if (course.id === sourceCourseId) {
          idMaps.courses.set(course.id, restoreToCourseId);
        }
      }
    }
    return null; // Don't create new courses
  }

  // Skip courses restoration if restoreToCourseId is set without sourceCourseId
  if (restoreToCourseId && !sourceCourseId) {
    if (backupData.data.courses) {
      for (const course of backupData.data.courses) {
        if (course.id) {
          idMaps.courses.set(course.id, restoreToCourseId);
        }
      }
    }
    return null;
  }

  if (!backupData.data.courses || backupData.data.courses.length === 0) {
    return null;
  }

  const coursesWithRemapping = remapForeignKeys(
    backupData.data.courses,
    { unitStandardId: 'unitStandards' },
    idMaps
  );

  return {
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
  };
}

// Helper: Restore rubrics
function restoreRubrics(
  backupData: BackupData,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (!backupData.data.rubrics || backupData.data.rubrics.length === 0) {
    return null;
  }

  return {
    key: 'rubrics',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const rubric of backupData.data.rubrics || []) {
        const { id: oldId, ...data } = rubric;
        try {
          const created = await tx.rubric.create({ data });
          insertedRecords.push(created);
          if (oldId) {
            idMaps.rubrics.set(oldId, created.id);
          }
        } catch (error: any) {
          if (error.code !== 'P2002') {
            throw error;
          }
        }
      }
      restoreStats.rubrics = insertedRecords.length;
    },
  };
}

// Helper: Restore rubric criteria
function restoreRubricCriteria(
  backupData: BackupData,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (!backupData.data.rubricCriteria || backupData.data.rubricCriteria.length === 0) {
    return null;
  }

  return {
    key: 'rubricCriteria',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const criteria of backupData.data.rubricCriteria || []) {
        const { id: oldId, ...data } = criteria;
        try {
          const created = await tx.rubricCriteria.create({ data });
          insertedRecords.push(created);
          if (oldId) {
            idMaps.rubricCriteria.set(oldId, created.id);
          }
        } catch (error: any) {
          if (error.code !== 'P2002') {
            throw error;
          }
        }
      }
      restoreStats.rubricCriteria = insertedRecords.length;
    },
  };
}

// Helper: Restore rubric levels
function restoreRubricLevels(
  backupData: BackupData,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (!backupData.data.rubricLevels || backupData.data.rubricLevels.length === 0) {
    return null;
  }

  return {
    key: 'rubricLevels',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const level of backupData.data.rubricLevels || []) {
        const { id: oldId, ...data } = level;
        try {
          const created = await tx.rubricLevel.create({ data });
          insertedRecords.push(created);
          if (oldId) {
            idMaps.rubricLevels.set(oldId, created.id);
          }
        } catch (error: any) {
          if (error.code !== 'P2002') {
            throw error;
          }
        }
      }
      restoreStats.rubricLevels = insertedRecords.length;
    },
  };
}

// Helper: Restore lessons
function restoreLessons(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  const { sourceCourseId } = options;
  
  let lessonsToRestore = backupData.data.lessons || [];
  
  // Filter by source course if specified
  if (sourceCourseId) {
    lessonsToRestore = lessonsToRestore.filter(
      (lesson: any) => lesson.courseId === sourceCourseId
    );
  }

  if (lessonsToRestore.length === 0) {
    return null;
  }

  const lessonsWithRemapping = remapForeignKeys(
    lessonsToRestore,
    { courseId: 'courses' },
    idMaps
  );

  const validLessons = lessonsWithRemapping.filter(
    ({ data }) => data.courseId !== null
  );

  if (validLessons.length === 0) {
    return null;
  }

  return {
    key: 'lessons',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { oldId, data } of validLessons) {
        try {
          let existing = null;
          if (data.number !== undefined && data.courseId) {
            try {
              existing = await tx.lesson.findFirst({
                where: {
                  number: data.number,
                  courseId: data.courseId,
                },
              });
            } catch {
              // Ignore
            }
          }
          
          if (existing) {
            if (oldId) {
              idMaps.lessons.set(oldId, existing.id);
            }
          } else {
            const created = await tx.lesson.create({ data });
            insertedRecords.push(created);
            if (oldId) {
              idMaps.lessons.set(oldId, created.id);
            }
          }
        } catch (error: any) {
          if (error.code === 'P2002') {
            if (data.number !== undefined && data.courseId) {
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
              } catch {
                // Ignore
              }
            }
          } else {
            throw error;
          }
        }
      }
      restoreStats.lessons = insertedRecords.length;
    },
  };
}

// Helper: Restore exercises
function restoreExercises(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  // Skip if exercises are disabled
  if (options.skipExercises) {
    return null;
  }

  const { sourceCourseId } = options;
  
  let exercisesToRestore = backupData.data.exercises || [];
  
  // If source course is specified, filter exercises by course
  if (sourceCourseId) {
    const courseData = filterCourseRelatedData(backupData, sourceCourseId);
    exercisesToRestore = courseData.exercises;
  }

  if (exercisesToRestore.length === 0) {
    return null;
  }

  const exercisesWithRemapping = remapForeignKeys(
    exercisesToRestore,
    { lessonId: 'lessons', rubricId: 'rubrics', competencyUnitId: 'competencyUnits' },
    idMaps
  );

  const validExercises = exercisesWithRemapping.filter(
    ({ data }) => data.lessonId !== null && data.rubricId !== null
  );

  if (validExercises.length === 0) {
    return null;
  }

  return {
    key: 'exercises',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { oldId, data } of validExercises) {
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
  };
}

// Helper: Restore quiz questions
function restoreQuizQuestions(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  // Skip if quiz questions are disabled
  if (options.skipQuizQuestions) {
    return null;
  }

  const { sourceCourseId } = options;
  
  let quizQuestionsToRestore = backupData.data.quizQuestions || [];
  
  // If source course is specified, filter quiz questions by course
  if (sourceCourseId) {
    const courseData = filterCourseRelatedData(backupData, sourceCourseId);
    quizQuestionsToRestore = courseData.quizQuestions;
  }

  if (quizQuestionsToRestore.length === 0) {
    return null;
  }

  const quizQuestionsWithRemapping = remapForeignKeys(
    quizQuestionsToRestore,
    { lessonId: 'lessons' },
    idMaps
  );

  const validQuizQuestions = quizQuestionsWithRemapping.filter(
    ({ data }) => data.lessonId !== null
  );

  if (validQuizQuestions.length === 0) {
    return null;
  }

  return {
    key: 'quizQuestions',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validQuizQuestions) {
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
  };
}

// Helper: Restore lesson notes
function restoreLessonNotes(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  // Skip if lesson notes are disabled
  if (options.skipLessonNotes) {
    return null;
  }

  const { sourceCourseId } = options;
  
  let lessonNotesToRestore = backupData.data.lessonNotes || [];
  
  // If source course is specified, filter lesson notes by course
  if (sourceCourseId) {
    const courseData = filterCourseRelatedData(backupData, sourceCourseId);
    lessonNotesToRestore = courseData.lessonNotes;
  }

  if (lessonNotesToRestore.length === 0) {
    return null;
  }

  const lessonNotesWithRemapping = remapForeignKeys(
    lessonNotesToRestore,
    { lessonId: 'lessons' },
    idMaps
  );

  const validLessonNotes = lessonNotesWithRemapping.filter(
    ({ data }) => data.lessonId !== null
  );

  if (validLessonNotes.length === 0) {
    return null;
  }

  return {
    key: 'lessonNotes',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validLessonNotes) {
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
  };
}

// Helper: Restore PDF resources
function restorePDFResources(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  // Skip if PDF resources are disabled
  if (options.skipPdfResources) {
    return null;
  }

  const { sourceCourseId } = options;
  
  let pdfResourcesToRestore = backupData.data.pdfResources || [];
  
  // If source course is specified, filter PDF resources by course
  if (sourceCourseId) {
    const courseData = filterCourseRelatedData(backupData, sourceCourseId);
    pdfResourcesToRestore = courseData.pdfResources;
  }

  if (pdfResourcesToRestore.length === 0) {
    return null;
  }

  const pdfResourcesWithRemapping = remapForeignKeys(
    pdfResourcesToRestore,
    { lessonId: 'lessons' },
    idMaps
  );

  const validPDFResources = pdfResourcesWithRemapping.filter(
    ({ data }) => data.lessonId !== null
  );

  if (validPDFResources.length === 0) {
    return null;
  }

  return {
    key: 'pdfResources',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validPDFResources) {
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
  };
}

// Helper: Restore rubric mappings
function restoreRubricMappings(
  backupData: BackupData,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation[] {
  const operations: RestoreOperation[] = [];

  // Rubric criteria mappings
  if (backupData.data.rubricCriteriaMappings && backupData.data.rubricCriteriaMappings.length > 0) {
    const mappingsWithRemapping = remapForeignKeys(
      backupData.data.rubricCriteriaMappings,
      { rubricId: 'rubrics', criteriaId: 'rubricCriteria' },
      idMaps
    );

    const validMappings = mappingsWithRemapping.filter(
      ({ data }) => data.rubricId !== null && data.criteriaId !== null
    );

    if (validMappings.length > 0) {
      operations.push({
        key: 'rubricCriteriaMappings',
        restoreFn: async () => {
          const insertedRecords = [];
          for (const { data } of validMappings) {
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

  // Rubric level mappings
  if (backupData.data.rubricLevelMappings && backupData.data.rubricLevelMappings.length > 0) {
    const mappingsWithRemapping = remapForeignKeys(
      backupData.data.rubricLevelMappings,
      { rubricId: 'rubrics', levelId: 'rubricLevels' },
      idMaps
    );

    const validMappings = mappingsWithRemapping.filter(
      ({ data }) => data.rubricId !== null && data.levelId !== null
    );

    if (validMappings.length > 0) {
      operations.push({
        key: 'rubricLevelMappings',
        restoreFn: async () => {
          const insertedRecords = [];
          for (const { data } of validMappings) {
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

  return operations;
}

// Helper: Restore assessor accreditations
function restoreAssessorAccreditations(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.assessorAccreditations || backupData.data.assessorAccreditations.length === 0) {
    return null;
  }

  const accreditationsWithRemapping = remapForeignKeys(
    backupData.data.assessorAccreditations,
    { instructorId: 'instructors' },
    idMaps
  );

  const validAccreditations = accreditationsWithRemapping.filter(
    ({ data }) => data.instructorId !== null
  );

  if (validAccreditations.length === 0) {
    return null;
  }

  return {
    key: 'assessorAccreditations',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validAccreditations) {
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
  };
}

// Helper: Restore course instructors
function restoreCourseInstructors(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  const { restoreToCourseId } = options;
  
  // Skip for course-specific restore
  if (restoreToCourseId) {
    return null;
  }

  if (!backupData.data.courseInstructors || backupData.data.courseInstructors.length === 0) {
    return null;
  }

  const courseInstructorsWithRemapping = remapForeignKeys(
    backupData.data.courseInstructors,
    { courseId: 'courses', instructorId: 'instructors' },
    idMaps
  );

  const validCourseInstructors = courseInstructorsWithRemapping.filter(
    ({ data }) => data.courseId !== null && data.instructorId !== null
  );

  if (validCourseInstructors.length === 0) {
    return null;
  }

  return {
    key: 'courseInstructors',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validCourseInstructors) {
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
  };
}

// Helper: Restore course subscriptions
function restoreCourseSubscriptions(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  const { restoreToCourseId } = options;
  
  // Skip for course-specific restore
  if (restoreToCourseId) {
    return null;
  }

  if (!backupData.data.courseSubscriptions || backupData.data.courseSubscriptions.length === 0) {
    return null;
  }

  const subscriptionsWithRemapping = remapForeignKeys(
    backupData.data.courseSubscriptions,
    { userId: 'users', studentId: 'students', courseId: 'courses' },
    idMaps
  );

  const validSubscriptions = subscriptionsWithRemapping.filter(
    ({ data }) => data.studentId !== null && data.courseId !== null
  );

  if (validSubscriptions.length === 0) {
    return null;
  }

  return {
    key: 'courseSubscriptions',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validSubscriptions) {
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
  };
}

// Helper: Restore exercise submissions
function restoreExerciseSubmissions(
  backupData: BackupData,
  tx: any,
  options: RestoreOptions,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  const { restoreToCourseId } = options;
  
  // Skip for course-specific restore
  if (restoreToCourseId) {
    return null;
  }

  if (!backupData.data.exerciseSubmissions || backupData.data.exerciseSubmissions.length === 0) {
    return null;
  }

  const submissionsWithRemapping = remapForeignKeys(
    backupData.data.exerciseSubmissions,
    { studentId: 'students', exerciseId: 'exercises' },
    idMaps
  );

  const validSubmissions = submissionsWithRemapping.filter(
    ({ data }) => data.studentId !== null && data.exerciseId !== null
  );

  if (validSubmissions.length === 0) {
    return null;
  }

  return {
    key: 'exerciseSubmissions',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validSubmissions) {
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
  };
}

// Helper: Restore grades
function restoreGrades(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.grades || backupData.data.grades.length === 0) {
    return null;
  }

  const gradesWithRemapping = remapForeignKeys(
    backupData.data.grades,
    {
      studentId: 'students',
      lessonId: 'lessons',
      exerciseId: 'exercises',
      assessorId: 'instructors',
      verifiedBy: 'instructors',
      moderatedBy: 'instructors',
    },
    idMaps
  );

  const validGrades = gradesWithRemapping.filter(
    ({ data }) => data.studentId !== null && data.lessonId !== null && data.exerciseId !== null
  );

  if (validGrades.length === 0) {
    return null;
  }

  return {
    key: 'grades',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validGrades) {
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
  };
}

// Helper: Restore grade criteria
function restoreGradeCriteria(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.gradeCriteria || backupData.data.gradeCriteria.length === 0) {
    return null;
  }

  const gradeCriteriaWithRemapping = remapForeignKeys(
    backupData.data.gradeCriteria,
    { gradeId: 'grades', criteriaId: 'rubricCriteria', levelId: 'rubricLevels' },
    idMaps
  );

  const validGradeCriteria = gradeCriteriaWithRemapping.filter(
    ({ data }) => data.gradeId !== null && data.criteriaId !== null && data.levelId !== null
  );

  if (validGradeCriteria.length === 0) {
    return null;
  }

  return {
    key: 'gradeCriteria',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validGradeCriteria) {
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
  };
}

// Helper: Restore quiz attempts
function restoreQuizAttempts(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.quizAttempts || backupData.data.quizAttempts.length === 0) {
    return null;
  }

  const quizAttemptsWithRemapping = remapForeignKeys(
    backupData.data.quizAttempts,
    { studentId: 'students', lessonId: 'lessons' },
    idMaps
  );

  const validAttempts = quizAttemptsWithRemapping.filter(
    ({ data }) => data.studentId !== null && data.lessonId !== null
  );

  if (validAttempts.length === 0) {
    return null;
  }

  return {
    key: 'quizAttempts',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validAttempts) {
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
  };
}

// Helper: Restore assessment audit logs
function restoreAssessmentAuditLogs(
  backupData: BackupData,
  tx: any,
  skip: boolean,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): RestoreOperation | null {
  if (skip || !backupData.data.assessmentAuditLogs || backupData.data.assessmentAuditLogs.length === 0) {
    return null;
  }

  const auditLogsWithRemapping = remapForeignKeys(
    backupData.data.assessmentAuditLogs,
    { gradeId: 'grades' },
    idMaps
  );

  const validAuditLogs = auditLogsWithRemapping.filter(
    ({ data }) => data.gradeId !== null
  );

  if (validAuditLogs.length === 0) {
    return null;
  }

  return {
    key: 'assessmentAuditLogs',
    restoreFn: async () => {
      const insertedRecords = [];
      for (const { data } of validAuditLogs) {
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
  };
}

// Helper: Restore from nested course structure
async function restoreFromNestedStructure(
  backupData: BackupData,
  options: RestoreOptions,
  tx: any,
  idMaps: IdMaps,
  restoreStats: Record<string, number>
): Promise<void> {
  if (!backupData.data.coursesNested || backupData.data.coursesNested.length === 0) {
    return;
  }

  let coursesToRestore = backupData.data.coursesNested;

  // Filter by source course if specified
  if (options.sourceCourseId) {
    coursesToRestore = coursesToRestore.filter(
      (courseData) => courseData.course.id === options.sourceCourseId
    );
  }

  // Restore each course with its nested data
  for (const courseData of coursesToRestore) {
    const { course: courseRecord, lessons: lessonsData } = courseData;
    const { id: oldCourseId, ...courseDataWithoutId } = courseRecord;

    // Map course ID
    let newCourseId: string;
    if (options.restoreToCourseId && options.sourceCourseId === oldCourseId) {
      // Use destination course ID
      newCourseId = options.restoreToCourseId;
      idMaps.courses.set(oldCourseId, newCourseId);
    } else {
      // Create or find existing course
      try {
        const existing = await tx.course.findFirst({
          where: { title: courseDataWithoutId.title },
        });
        if (existing) {
          newCourseId = existing.id;
          idMaps.courses.set(oldCourseId, newCourseId);
        } else {
          const created = await tx.course.create({
            data: courseDataWithoutId,
          });
          newCourseId = created.id;
          idMaps.courses.set(oldCourseId, newCourseId);
          restoreStats.courses = (restoreStats.courses || 0) + 1;
        }
      } catch (error: any) {
        if (error.code !== 'P2002') {
          throw error;
        }
        // Try to find existing
        const existing = await tx.course.findFirst({
          where: { title: courseDataWithoutId.title },
        });
        if (existing) {
          newCourseId = existing.id;
          idMaps.courses.set(oldCourseId, newCourseId);
        } else {
          throw error;
        }
      }
    }

    // Restore lessons with all their related data
    for (const lessonData of lessonsData) {
      const { lesson: lessonRecord, exercises, quizQuestions, lessonNotes, pdfResources } = lessonData;
      const { id: oldLessonId, ...lessonDataWithoutId } = lessonRecord;

      // Update lesson courseId to new course ID
      const lessonToCreate = {
        ...lessonDataWithoutId,
        courseId: newCourseId,
      };

      // Create or find existing lesson
      let newLessonId: string;
      try {
        const existing = await tx.lesson.findFirst({
          where: {
            number: lessonToCreate.number,
            courseId: newCourseId,
          },
        });
        if (existing) {
          newLessonId = existing.id;
          idMaps.lessons.set(oldLessonId, newLessonId);
        } else {
          const created = await tx.lesson.create({
            data: lessonToCreate,
          });
          newLessonId = created.id;
          idMaps.lessons.set(oldLessonId, newLessonId);
          restoreStats.lessons = (restoreStats.lessons || 0) + 1;
        }
      } catch (error: any) {
        if (error.code === 'P2002') {
          const existing = await tx.lesson.findFirst({
            where: {
              number: lessonToCreate.number,
              courseId: newCourseId,
            },
          });
          if (existing) {
            newLessonId = existing.id;
            idMaps.lessons.set(oldLessonId, newLessonId);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      // Restore exercises for this lesson (if not skipped)
      if (!options.skipExercises) {
        for (const exercise of exercises) {
          const { id: oldExerciseId, ...exerciseDataWithoutId } = exercise;
          
          // Remap foreign keys
          const exerciseToCreate: any = {
            ...exerciseDataWithoutId,
            lessonId: newLessonId,
          };
          
          // Remap rubricId if needed
          if (exerciseDataWithoutId.rubricId && idMaps.rubrics.has(exerciseDataWithoutId.rubricId)) {
            exerciseToCreate.rubricId = idMaps.rubrics.get(exerciseDataWithoutId.rubricId);
          }
          
          // Remap competencyUnitId if needed
          if (exerciseDataWithoutId.competencyUnitId && idMaps.competencyUnits.has(exerciseDataWithoutId.competencyUnitId)) {
            exerciseToCreate.competencyUnitId = idMaps.competencyUnits.get(exerciseDataWithoutId.competencyUnitId);
          }

          try {
            const created = await tx.exercise.create({
              data: exerciseToCreate,
            });
            if (oldExerciseId) {
              idMaps.exercises.set(oldExerciseId, created.id);
            }
            restoreStats.exercises = (restoreStats.exercises || 0) + 1;
          } catch (error: any) {
            if (error.code !== 'P2002') {
              throw error;
            }
          }
        }
      }

      // Restore quiz questions for this lesson (if not skipped)
      if (!options.skipQuizQuestions) {
        for (const quizQuestion of quizQuestions) {
          const { id, ...quizQuestionDataWithoutId } = quizQuestion;
          const quizQuestionToCreate = {
            ...quizQuestionDataWithoutId,
            lessonId: newLessonId,
          };

          try {
            await tx.quizQuestion.create({
              data: quizQuestionToCreate,
            });
            restoreStats.quizQuestions = (restoreStats.quizQuestions || 0) + 1;
          } catch (error: any) {
            if (error.code !== 'P2002') {
              throw error;
            }
          }
        }
      }

      // Restore lesson notes for this lesson (if not skipped)
      if (!options.skipLessonNotes) {
        for (const lessonNote of lessonNotes) {
          const { id, ...lessonNoteDataWithoutId } = lessonNote;
          const lessonNoteToCreate = {
            ...lessonNoteDataWithoutId,
            lessonId: newLessonId,
          };

          try {
            await tx.lessonNote.create({
              data: lessonNoteToCreate,
            });
            restoreStats.lessonNotes = (restoreStats.lessonNotes || 0) + 1;
          } catch (error: any) {
            if (error.code !== 'P2002') {
              throw error;
            }
          }
        }
      }

      // Restore PDF resources for this lesson (if not skipped)
      if (!options.skipPdfResources) {
        for (const pdfResource of pdfResources) {
          const { id, ...pdfResourceDataWithoutId } = pdfResource;
          const pdfResourceToCreate = {
            ...pdfResourceDataWithoutId,
            lessonId: newLessonId,
          };

          try {
            await tx.pDFResource.create({
              data: pdfResourceToCreate,
            });
            restoreStats.pdfResources = (restoreStats.pdfResources || 0) + 1;
          } catch (error: any) {
            if (error.code !== 'P2002') {
              throw error;
            }
          }
        }
      }
    }
  }
}

// Main restore function
async function performRestore(
  backupData: BackupData,
  options: RestoreOptions,
  tx: any
): Promise<{ success: boolean; stats: Record<string, number>; metadata: BackupData['metadata'] }> {
  const restoreStats: Record<string, number> = {};
  const idMaps: IdMaps = {
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

  // If nested structure exists, use it for course restoration
  if (backupData.data.coursesNested && backupData.data.coursesNested.length > 0) {
    // Restore prerequisites first (users, cohorts, rubrics, etc.)
    const restoreOperations: RestoreOperation[] = [];

    const userOp = restoreUsers(backupData, tx, options.skipUsers || false, idMaps, restoreStats);
    if (userOp) restoreOperations.push(userOp);

    const cohortOp = restoreCohorts(backupData, tx, idMaps, restoreStats);
    if (cohortOp) restoreOperations.push(cohortOp);

    const studentOp = restoreStudents(backupData, tx, options.skipUsers || false, idMaps, restoreStats);
    if (studentOp) restoreOperations.push(studentOp);

    const instructorOp = restoreInstructors(backupData, tx, options.skipUsers || false, idMaps, restoreStats);
    if (instructorOp) restoreOperations.push(instructorOp);

    const assessorAccreditationOp = restoreAssessorAccreditations(
      backupData,
      tx,
      options.skipUsers || false,
      idMaps,
      restoreStats
    );
    if (assessorAccreditationOp) restoreOperations.push(assessorAccreditationOp);

    const unitStandardOp = restoreUnitStandards(backupData, tx, idMaps, restoreStats);
    if (unitStandardOp) restoreOperations.push(unitStandardOp);

    const competencyUnitOp = restoreCompetencyUnits(backupData, tx, idMaps, restoreStats);
    if (competencyUnitOp) restoreOperations.push(competencyUnitOp);

    const rubricOp = restoreRubrics(backupData, tx, idMaps, restoreStats);
    if (rubricOp) restoreOperations.push(rubricOp);

    const rubricCriteriaOp = restoreRubricCriteria(backupData, tx, idMaps, restoreStats);
    if (rubricCriteriaOp) restoreOperations.push(rubricCriteriaOp);

    const rubricLevelOp = restoreRubricLevels(backupData, tx, idMaps, restoreStats);
    if (rubricLevelOp) restoreOperations.push(rubricLevelOp);

    const rubricMappingOps = restoreRubricMappings(backupData, tx, idMaps, restoreStats);
    restoreOperations.push(...rubricMappingOps);

    // Execute prerequisite operations
    for (const op of restoreOperations) {
      try {
        await op.restoreFn();
      } catch (error: any) {
        console.error(`Error restoring ${op.key}:`, error);
        throw error;
      }
    }

    // Now restore from nested structure
    await restoreFromNestedStructure(backupData, options, tx, idMaps, restoreStats);

    // Restore remaining data (grades, submissions, etc.) using flat structure if available
    const remainingOps: RestoreOperation[] = [];

    const courseInstructorOp = restoreCourseInstructors(backupData, tx, options, idMaps, restoreStats);
    if (courseInstructorOp) remainingOps.push(courseInstructorOp);

    const courseSubscriptionOp = restoreCourseSubscriptions(backupData, tx, options, idMaps, restoreStats);
    if (courseSubscriptionOp) remainingOps.push(courseSubscriptionOp);

    const exerciseSubmissionOp = restoreExerciseSubmissions(backupData, tx, options, idMaps, restoreStats);
    if (exerciseSubmissionOp) remainingOps.push(exerciseSubmissionOp);

    const gradeOp = restoreGrades(backupData, tx, options.skipGrades || false, idMaps, restoreStats);
    if (gradeOp) remainingOps.push(gradeOp);

    const gradeCriteriaOp = restoreGradeCriteria(backupData, tx, options.skipGrades || false, idMaps, restoreStats);
    if (gradeCriteriaOp) remainingOps.push(gradeCriteriaOp);

    const quizAttemptOp = restoreQuizAttempts(backupData, tx, options.skipQuizAttempts || false, idMaps, restoreStats);
    if (quizAttemptOp) remainingOps.push(quizAttemptOp);

    const auditLogOp = restoreAssessmentAuditLogs(backupData, tx, options.skipGrades || false, idMaps, restoreStats);
    if (auditLogOp) remainingOps.push(auditLogOp);

    // Execute remaining operations
    for (const op of remainingOps) {
      try {
        await op.restoreFn();
      } catch (error: any) {
        console.error(`Error restoring ${op.key}:`, error);
        throw error;
      }
    }

    return {
      success: true,
      stats: restoreStats,
      metadata: backupData.metadata,
    };
  }

  // Fall back to flat structure (backward compatibility)
  const restoreOperations: RestoreOperation[] = [];

  // Build restore operations in dependency order
  const userOp = restoreUsers(backupData, tx, options.skipUsers || false, idMaps, restoreStats);
  if (userOp) restoreOperations.push(userOp);

  const cohortOp = restoreCohorts(backupData, tx, idMaps, restoreStats);
  if (cohortOp) restoreOperations.push(cohortOp);

  const studentOp = restoreStudents(backupData, tx, options.skipUsers || false, idMaps, restoreStats);
  if (studentOp) restoreOperations.push(studentOp);

  const instructorOp = restoreInstructors(backupData, tx, options.skipUsers || false, idMaps, restoreStats);
  if (instructorOp) restoreOperations.push(instructorOp);

  const assessorAccreditationOp = restoreAssessorAccreditations(
    backupData,
    tx,
    options.skipUsers || false,
    idMaps,
    restoreStats
  );
  if (assessorAccreditationOp) restoreOperations.push(assessorAccreditationOp);

  const unitStandardOp = restoreUnitStandards(backupData, tx, idMaps, restoreStats);
  if (unitStandardOp) restoreOperations.push(unitStandardOp);

  const competencyUnitOp = restoreCompetencyUnits(backupData, tx, idMaps, restoreStats);
  if (competencyUnitOp) restoreOperations.push(competencyUnitOp);

  const rubricOp = restoreRubrics(backupData, tx, idMaps, restoreStats);
  if (rubricOp) restoreOperations.push(rubricOp);

  const rubricCriteriaOp = restoreRubricCriteria(backupData, tx, idMaps, restoreStats);
  if (rubricCriteriaOp) restoreOperations.push(rubricCriteriaOp);

  const rubricLevelOp = restoreRubricLevels(backupData, tx, idMaps, restoreStats);
  if (rubricLevelOp) restoreOperations.push(rubricLevelOp);

  const rubricMappingOps = restoreRubricMappings(backupData, tx, idMaps, restoreStats);
  restoreOperations.push(...rubricMappingOps);

  const courseOp = restoreCourses(backupData, tx, options, idMaps, restoreStats);
  if (courseOp) restoreOperations.push(courseOp);

  const courseInstructorOp = restoreCourseInstructors(backupData, tx, options, idMaps, restoreStats);
  if (courseInstructorOp) restoreOperations.push(courseInstructorOp);

  const lessonOp = restoreLessons(backupData, tx, options, idMaps, restoreStats);
  if (lessonOp) restoreOperations.push(lessonOp);

  const exerciseOp = restoreExercises(backupData, tx, options, idMaps, restoreStats);
  if (exerciseOp) restoreOperations.push(exerciseOp);

  const quizQuestionOp = restoreQuizQuestions(backupData, tx, options, idMaps, restoreStats);
  if (quizQuestionOp) restoreOperations.push(quizQuestionOp);

  const lessonNoteOp = restoreLessonNotes(backupData, tx, options, idMaps, restoreStats);
  if (lessonNoteOp) restoreOperations.push(lessonNoteOp);

  const pdfResourceOp = restorePDFResources(backupData, tx, options, idMaps, restoreStats);
  if (pdfResourceOp) restoreOperations.push(pdfResourceOp);

  const courseSubscriptionOp = restoreCourseSubscriptions(backupData, tx, options, idMaps, restoreStats);
  if (courseSubscriptionOp) restoreOperations.push(courseSubscriptionOp);

  const exerciseSubmissionOp = restoreExerciseSubmissions(backupData, tx, options, idMaps, restoreStats);
  if (exerciseSubmissionOp) restoreOperations.push(exerciseSubmissionOp);

  const gradeOp = restoreGrades(backupData, tx, options.skipGrades || false, idMaps, restoreStats);
  if (gradeOp) restoreOperations.push(gradeOp);

  const gradeCriteriaOp = restoreGradeCriteria(backupData, tx, options.skipGrades || false, idMaps, restoreStats);
  if (gradeCriteriaOp) restoreOperations.push(gradeCriteriaOp);

  const quizAttemptOp = restoreQuizAttempts(backupData, tx, options.skipQuizAttempts || false, idMaps, restoreStats);
  if (quizAttemptOp) restoreOperations.push(quizAttemptOp);

  const auditLogOp = restoreAssessmentAuditLogs(backupData, tx, options.skipGrades || false, idMaps, restoreStats);
  if (auditLogOp) restoreOperations.push(auditLogOp);

  // Execute all restore operations
  for (const op of restoreOperations) {
    try {
      await op.restoreFn();
    } catch (error: any) {
      console.error(`Error restoring ${op.key}:`, error);
      throw error;
    }
  }

  return {
    success: true,
    stats: restoreStats,
    metadata: backupData.metadata,
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

    const restoreOptions: RestoreOptions = {
      clearExisting: options?.clearExisting || false,
      skipUsers: options?.skipUsers || false,
      skipGrades: options?.skipGrades || false,
      skipQuizAttempts: options?.skipQuizAttempts || false,
      restoreToCourseId: options?.restoreToCourseId || '',
      sourceCourseId: options?.sourceCourseId || '',
      skipExercises: options?.skipExercises || false,
      skipQuizQuestions: options?.skipQuizQuestions || false,
      skipLessonNotes: options?.skipLessonNotes || false,
      skipPdfResources: options?.skipPdfResources || false,
    };

    // Validate backup version
    if (backupData.metadata.version !== '1.0.0') {
      return NextResponse.json(
        { error: `Unsupported backup version: ${backupData.metadata.version}` },
        { status: 400 }
      );
    }

    // Validate source course ID if provided
    if (restoreOptions.sourceCourseId) {
      const sourceCourse = backupData.data.courses?.find(
        (c: any) => c.id === restoreOptions.sourceCourseId
      );
      if (!sourceCourse) {
        return NextResponse.json(
          { error: `Source course with ID ${restoreOptions.sourceCourseId} not found in backup` },
          { status: 400 }
        );
      }
    }

    // Validate destination course ID if provided
    if (restoreOptions.restoreToCourseId) {
      const targetCourse = await prisma.course.findUnique({
        where: { id: restoreOptions.restoreToCourseId },
      });
      if (!targetCourse) {
        return NextResponse.json(
          { error: `Target course with ID ${restoreOptions.restoreToCourseId} not found` },
          { status: 400 }
        );
      }
    }

    // Validate that both source and destination are provided together for course restore
    if (restoreOptions.restoreToCourseId && !restoreOptions.sourceCourseId) {
      return NextResponse.json(
        { error: 'Source course ID is required when restoring to a specific course' },
        { status: 400 }
      );
    }

    // Use transaction for atomic restore
    const result = await prisma.$transaction(async (tx) => {
      // Clear existing data if requested (only for full restore)
      if (restoreOptions.clearExisting && !restoreOptions.restoreToCourseId) {
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
        if (!restoreOptions.skipUsers) {
          await tx.student.deleteMany({});
          await tx.instructor.deleteMany({});
          await tx.user.deleteMany({});
        }
        await tx.cohort.deleteMany({});
      }

      return await performRestore(backupData, restoreOptions, tx);
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
