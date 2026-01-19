'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Lock,
  ExternalLink,
  Code,
  FileText,
  Download,
  Clock,
  Award,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  maxPoints: number;
  submissionCount: number;
  gradeCount: number;
  rubric: {
    id: string;
    name: string;
    description: string | null;
    totalPoints: number;
    criteria: Array<{
      id: string;
      name: string;
      description: string | null;
      weight: number;
    }>;
    levels: Array<{
      id: string;
      name: string;
      description: string | null;
      points: number;
      color: string | null;
    }>;
  };
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  order: number;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string | null;
  duration: string | null;
  courseId: string;
  course: {
    id: string;
    title: string;
    isActive: boolean;
  };
  exercises: Exercise[];
  quizQuestions: QuizQuestion[];
  stats: {
    exerciseCount: number;
    quizQuestionCount: number;
    quizAttemptCount: number;
    gradeCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface QuizAttempt {
  id: string;
  lessonId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

interface LessonNote {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  section: string;
}

interface StudentProfile {
  id: string;
}

export default function StudentLessonPage() {
  const params = useParams();
  const { data: session } = useSession();
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [allQuizAttempts, setAllQuizAttempts] = useState<QuizAttempt[]>([]);
  const [exerciseSubmissions, setExerciseSubmissions] = useState<Array<{ exerciseId: string; lessonId: string }>>([]);
  const [courseLessons, setCourseLessons] = useState<Array<{ id: string; number: number }>>([]);
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'exercise' | 'notes'>('content');

  // Fetch student profile ID
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/students?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.students && data.students.length > 0) {
            setStudentProfile({ id: data.students[0].id });
          }
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    };

    fetchStudentProfile();
  }, [session?.user?.id]);

  // Fetch lesson data
  useEffect(() => {
    const loadLessonData = async () => {
      if (!studentProfile) return;

      try {
        setLoading(true);
        setError(null);
        setIsLocked(false);

        // Fetch lesson from API
        const lessonResponse = await fetch(`/api/lessons/${lessonId}`);
        if (!lessonResponse.ok) {
          throw new Error('Failed to fetch lesson');
        }
        const lessonData = await lessonResponse.json();
        setLesson(lessonData.lesson);

        // Fetch all quiz attempts for the student (to check previous lesson completion)
        const allQuizResponse = await fetch(
          `/api/quiz-attempts?studentId=${studentProfile.id}`
        );
        if (allQuizResponse.ok) {
          const allQuizData = await allQuizResponse.json();
          setAllQuizAttempts(allQuizData.attempts || []);
        }

        // Fetch exercise submissions
        const submissionsResponse = await fetch(`/api/exercise-submissions?studentId=${studentProfile.id}`);
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          setExerciseSubmissions(
            (submissionsData.submissions || [])
              .filter((sub: any) => sub.lessonId)
              .map((sub: any) => ({
                exerciseId: sub.exerciseId,
                lessonId: sub.lessonId,
              }))
          );
        }

        // Fetch quiz attempts for this lesson
        const quizResponse = await fetch(
          `/api/quiz-attempts?studentId=${studentProfile.id}&lessonId=${lessonId}`
        );
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          setQuizAttempts(quizData.attempts || []);
        }

        // Fetch all lessons from the course to check unlocking
        const coursesResponse = await fetch('/api/student/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          const course = coursesData.courses.find(
            (c: { id: string }) => c.id === lessonData.lesson.courseId
          );
          if (course) {
            setCourseLessons(
              course.lessons.map((l: { id: string; number: number }) => ({
                id: l.id,
                number: l.number,
              }))
            );
          }
        }

        // Fetch lesson notes
        const notesResponse = await fetch(`/api/lesson-notes?lessonId=${lessonId}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setLessonNotes(notesData.notes || []);
        }
      } catch (error) {
        console.error('Error loading lesson data:', error);
        setError('Failed to load lesson data');
      } finally {
        setLoading(false);
      }
    };

    if (studentProfile) {
    loadLessonData();
    }
  }, [lessonId, studentProfile]);

  // Check if lesson is unlocked
  useEffect(() => {
    if (!lesson || courseLessons.length === 0) return;

    // First lesson in a course is always unlocked
    if (lesson.number === 1) {
      setIsLocked(false);
      return;
    }

    // Find the previous lesson in the same course
    const previousLesson = courseLessons.find((l) => l.number === lesson.number - 1);

    if (!previousLesson) {
      // If previous lesson doesn't exist, unlock it (shouldn't happen, but be safe)
      setIsLocked(false);
      return;
    }

    // Check if previous lesson's quiz is passed
    const hasPassedPreviousQuiz = allQuizAttempts.some(
      (attempt) => attempt.lessonId === previousLesson.id && attempt.passed
    );

    // Check if previous lesson has exercise submission
    const hasSubmittedPreviousExercise = exerciseSubmissions.some(
      (sub) => sub.lessonId === previousLesson.id
    );

    // Lesson is unlocked if previous lesson is completed (quiz passed OR exercise submitted)
    const isPreviousCompleted = hasPassedPreviousQuiz || hasSubmittedPreviousExercise;
    setIsLocked(!isPreviousCompleted);
  }, [lesson, courseLessons, allQuizAttempts, exerciseSubmissions]);

  const hasPassedQuiz = () => {
    return quizAttempts.some((attempt) => attempt.passed);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading lesson...</span>
      </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !lesson) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {error || 'Lesson not found'}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/student"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
              >
            Back to Dashboard
          </Link>
        </div>
      </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (isLocked) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Locked</h2>
              <p className="text-gray-600 mb-6">
                You need to complete the previous lesson's quiz to unlock this lesson.
              </p>
              <div className="space-x-4">
                <Link
                  href="/student"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
                >
                  Back to Dashboard
                </Link>
                {courseLessons.length > 0 && (
                  <Link
                    href={`/student/course/${lesson.courseId}`}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 inline-block"
                  >
                    View Course
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
                <Link
                  href="/student"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Lesson {lesson.number}: {lesson.title}
                </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    {lesson.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {lesson.duration}
                      </div>
                    )}
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {lesson.course.title}
                    </div>
                  </div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
              {hasPassedQuiz() ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Quiz Passed</span>
                </div>
              ) : (
                <Link
                  href={`/student/quiz/${lesson.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center"
                >
                    <HelpCircle className="h-4 w-4 mr-2" />
                  Take Quiz
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Navigation</h3>
              
              {/* Quiz Status */}
                <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-center mb-2">
                  {hasPassedQuiz() ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <span className="font-medium text-gray-900">Quiz Status</span>
                </div>
                <p className="text-sm text-gray-600">
                  {hasPassedQuiz() 
                    ? 'You have passed the quiz and can access all content.'
                      : 'Complete the quiz to unlock all lesson content.'}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                    activeTab === 'content'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Lesson Content
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                    activeTab === 'notes'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                    <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Online Notes
                      </div>
                    {lessonNotes.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {lessonNotes.length}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('exercise')}
                  className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                    activeTab === 'exercise'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Practical Exercise
                      {lesson.exercises.length > 0 && (
                        <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {lesson.exercises.length}
                        </span>
                      )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'content' ? (
              <div className="space-y-6">
                {/* Lesson Overview */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Overview</h2>
                    {lesson.description ? (
                  <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
                    ) : (
                      <p className="text-gray-500 italic">No description available for this lesson.</p>
                    )}
                </div>

                {/* Learning Objectives */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Objectives</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Understand the fundamental concepts and principles covered in this lesson
                        </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Apply knowledge through hands-on practice and exercises
                        </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Demonstrate competency through quiz assessment
                        </span>
                    </li>
                  </ul>
                </div>

                  {/* Lesson Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                      <div className="flex items-center">
                        <Code className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {lesson.stats.exerciseCount}
                          </div>
                          <div className="text-sm text-gray-600">Exercises</div>
                    </div>
                    </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                      <div className="flex items-center">
                        <HelpCircle className="h-5 w-5 text-purple-600 mr-2" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {lesson.stats.quizQuestionCount}
                  </div>
                          <div className="text-sm text-gray-600">Quiz Questions</div>
                </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {quizAttempts.length}
                          </div>
                          <div className="text-sm text-gray-600">Your Attempts</div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            ) : activeTab === 'notes' ? (
              <div className="space-y-6">
                {/* Online Notes */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Online Notes</h2>
                  
                  {lessonNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes available</h3>
                        <p className="text-gray-600">
                          Instructor notes for this lesson haven't been added yet.
                        </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                        {['introduction', 'objectives', 'content', 'examples', 'exercises', 'summary', 'resources'].map(
                          (section) => {
                            const sectionNotes = lessonNotes.filter((note) => note.section === section);
                        if (sectionNotes.length === 0) return null;

                            const sectionTitles: { [key: string]: string } = {
                          introduction: 'Introduction',
                          objectives: 'Learning Objectives',
                          content: 'Main Content',
                          examples: 'Examples',
                          exercises: 'Exercises',
                          summary: 'Summary',
                              resources: 'Additional Resources',
                        };

                        return (
                          <div key={section} className="border-l-4 border-blue-500 pl-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                  {sectionTitles[section]}
                            </h3>
                            <div className="space-y-4">
                                  {sectionNotes.map((note) => (
                                <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="font-medium text-gray-900 mb-2">{note.title}</h4>
                                      <div className="text-gray-700 markdown-content">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {note.content}
                                        </ReactMarkdown>
                                      </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                          }
                        )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Exercise Overview */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Practical Exercises</h2>
                    {lesson.exercises.length === 0 ? (
                      <div className="text-center py-8">
                        <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No exercises available</h3>
                        <p className="text-gray-600">Exercises for this lesson haven't been added yet.</p>
                      </div>
                    ) : (
                      lesson.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="mb-6 pb-6 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Exercise {index + 1}: {exercise.title}
                      </h3>
                              {exercise.description && (
                      <p className="text-gray-700 mb-4">{exercise.description}</p>
                              )}
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
                              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                <Award className="h-4 w-4 inline mr-1" />
                                {exercise.maxPoints} points
                              </div>
                            </div>
                          </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Rubric: {exercise.rubric.name}</h4>
                            {exercise.rubric.description && (
                              <p className="text-sm text-gray-600 mb-3">{exercise.rubric.description}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {exercise.rubric.criteria.slice(0, 4).map((criteria) => (
                                <div key={criteria.id} className="text-xs">
                                  <span className="font-medium text-gray-900">{criteria.name}</span>
                                  <span className="text-gray-600 ml-1">({criteria.weight}% weight)</span>
                                </div>
                              ))}
                            </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Link
                          href={`/student/exercise/${exercise.id}`}
                              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                        >
                              <Code className="h-4 w-4 mr-2" />
                          Start Exercise
                        </Link>
                            <button
                              onClick={() => {
                                // TODO: Show rubric modal
                                alert('Rubric details:\n\n' + exercise.rubric.criteria.map(c => `- ${c.name} (${c.weight}% weight)`).join('\n'));
                              }}
                              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                          View Rubric
                        </button>
                      </div>
                    </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
