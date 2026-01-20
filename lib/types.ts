export interface Student {
  id: string;
  name: string;
  email?: string;
  registrationNumber: string; // Primary identifier (replaces studentId)
  cohortId?: string;
  userId?: string; // Optional - link to User for authentication
  cohort?: {
    id: string;
    name: string;
  };
}

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
  };
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage of total grade
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  color: string;
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriteria[];
  levels: RubricLevel[];
  totalPoints: number;
}

export interface Grade {
  id: string;
  studentId: string;
  lessonId: string;
  exerciseId: string;
  criteriaGrades: {
    criteriaId: string;
    levelId: string;
    points: number;
    comments: string;
  }[];
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  letterGrade: string;
  // TVETA/CBET Compliance Fields
  isCompetent?: boolean;
  competencyStatus?: 'competent' | 'not_competent' | 'needs_improvement';
  assessorId?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  moderatedBy?: string;
  moderatedAt?: Date;
  feedback: string;
  gradedBy: string;
  gradedAt: Date;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  rubric: Rubric;
  maxPoints: number;
}

export interface BulkStudentUpload {
  registrationNumber: string;
  name: string;
  cohortName?: string; // For CSV parsing - will be converted to cohortId
  cohortId?: string;
}

export interface BulkGradeExport {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  bestGrade: number;
  bestPercentage: number;
  bestLetterGrade: string;
  totalExercises: number;
  completedExercises: number;
  averageGrade: number;
  grades: {
    lessonId: string;
    lessonTitle: string;
    exerciseId: string;
    exerciseTitle: string;
    points: number;
    maxPoints: number;
    percentage: number;
    letterGrade: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  lessonId: string;
  questions: {
    questionId: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
  score: number;
  passed: boolean;
  completedAt: Date;
  timeSpent: number; // in seconds
}

export interface CodingStandards {
  htmlValidation: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  cssValidation: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  accessibility: {
    passed: boolean;
    score: number;
    issues: string[];
  };
  performance: {
    passed: boolean;
    score: number;
    suggestions: string[];
  };
  overallScore: number;
}

export interface ExerciseSubmission {
  id: string;
  studentId: string;
  exerciseId: string;
  githubUrl: string;
  codingStandards: CodingStandards;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'needs_revision' | 'rejected';
}

export interface LessonNote {
  id: string;
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  title: string;
  content: string;
  section: 'introduction' | 'objectives' | 'content' | 'examples' | 'exercises' | 'summary' | 'resources';
  createdAt: Date;
  updatedAt: Date;
}

export interface PDFResource {
  id: string;
  title: string;
  description: string;
  lessonId?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

// TVETA/CBET Compliance Types

export interface UnitStandard {
  id: string;
  code: string;
  title: string;
  description?: string;
  knqfLevel: number;
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetencyUnit {
  id: string;
  unitStandardId: string;
  code: string;
  title: string;
  description?: string;
  performanceCriteria?: any[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  unitStandard?: UnitStandard;
}

export interface AssessorAccreditation {
  id: string;
  instructorId: string;
  accreditationType: 'assessor' | 'verifier' | 'moderator';
  accreditationNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentAuditLog {
  id: string;
  gradeId: string;
  action: 'assessed' | 'verified' | 'moderated' | 'updated' | 'exported';
  performedBy: string;
  performedByRole: 'instructor' | 'assessor' | 'verifier' | 'moderator' | 'admin';
  previousValue?: any;
  newValue?: any;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
