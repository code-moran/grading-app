'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Lock,
  Clock,
  Trophy,
  Users,
  AlertCircle,
  HelpCircle,
  Code,
  FileText,
  BarChart3,
  Target,
  Award,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string | null;
  duration: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
  lessonCount: number;
  instructors: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

interface QuizAttempt {
  id: string;
  lessonId: string;
  score: number;
  passed: boolean;
}

interface Grade {
  id: string;
  lessonId: string;
  exerciseId: string;
  percentage: number;
  totalPoints: number;
  maxPossiblePoints: number;
  letterGrade: string;
  gradedAt?: string;
}

interface ExerciseSubmission {
  exerciseId: string;
  lessonId: string;
  status: string;
  submittedAt: string;
}

export default function StudentCoursePage() {
  const params = useParams();
  const { data: session } = useSession();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [exerciseSubmissions, setExerciseSubmissions] = useState<ExerciseSubmission[]>([]);
  const [studentProfile, setStudentProfile] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'grades'>('overview');

  // Fetch student profile
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

  // Fetch course data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!studentProfile) return;

      try {
        setLoading(true);
        setError(null);

        // Get enrolled courses to find this course
        const coursesResponse = await fetch('/api/student/courses');
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses');
        }

        const coursesData = await coursesResponse.json();
        const foundCourse = coursesData.courses.find((c: Course) => c.id === courseId);

        if (!foundCourse) {
          setError('Course not found or you are not enrolled');
          return;
        }

        setCourse(foundCourse);

        // Fetch quiz attempts
        const quizResponse = await fetch(
          `/api/quiz-attempts?studentId=${studentProfile.id}`
        );
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          setQuizAttempts(quizData.attempts || []);
        }

        // Fetch grades
        const gradesResponse = await fetch(`/api/grades?studentId=${studentProfile.id}`);
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          setGrades(gradesData.grades || []);
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
                status: sub.status,
                submittedAt: sub.submittedAt,
              }))
          );
        }
      } catch (error) {
        console.error('Error loading course data:', error);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    if (studentProfile) {
      loadCourseData();
    }
  }, [courseId, studentProfile]);

  const hasPassedQuiz = (lessonId: string) => {
    return quizAttempts.some((attempt) => attempt.lessonId === lessonId && attempt.passed);
  };

  // Check if student has submitted exercises for a lesson
  const hasSubmittedExercise = (lessonId: string) => {
    return exerciseSubmissions.some((sub) => sub.lessonId === lessonId);
  };

  // Check if a lesson is completed (quiz passed OR exercise submitted)
  const isLessonCompleted = (lessonId: string) => {
    return hasPassedQuiz(lessonId) || hasSubmittedExercise(lessonId);
  };

  // Check if a lesson is unlocked (first lesson or previous lesson completed)
  const isLessonUnlocked = (lesson: { id: string; number: number }) => {
    // First lesson in a course is always unlocked
    if (lesson.number === 1) {
      return true;
    }

    // Find the previous lesson in the same course
    const previousLesson = course.lessons.find((l) => l.number === lesson.number - 1);

    if (!previousLesson) {
      // If previous lesson doesn't exist, unlock it (shouldn't happen, but be safe)
      return true;
    }

    // Lesson is unlocked if previous lesson is completed (quiz passed OR exercise submitted)
    return isLessonCompleted(previousLesson.id);
  };

  const getLessonGrade = (lessonId: string) => {
    const lessonGrades = grades.filter((grade) => grade.lessonId === lessonId);
    if (lessonGrades.length === 0) return null;
    return lessonGrades.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );
  };

  // Calculate course statistics
  const calculateCourseStats = () => {
    if (!course) return null;

    const courseLessons = course.lessons;
    const courseGrades = grades.filter((grade) =>
      courseLessons.some((lesson) => lesson.id === grade.lessonId)
    );
    const courseQuizAttempts = quizAttempts.filter((attempt) =>
      courseLessons.some((lesson) => lesson.id === attempt.lessonId)
    );
    const courseSubmissions = exerciseSubmissions.filter((sub) =>
      courseLessons.some((lesson) => lesson.id === sub.lessonId)
    );

    const completedLessons = courseLessons.filter((lesson) =>
      isLessonCompleted(lesson.id)
    ).length;

    const averageGrade =
      courseGrades.length > 0
        ? Math.round(
            courseGrades.reduce((sum, grade) => sum + grade.percentage, 0) / courseGrades.length
          )
        : 0;

    const totalPoints = courseGrades.reduce((sum, grade) => sum + grade.totalPoints, 0);
    const maxPossiblePoints = courseGrades.reduce(
      (sum, grade) => sum + grade.maxPossiblePoints,
      0
    );

    return {
      totalLessons: courseLessons.length,
      completedLessons,
      completionPercentage: courseLessons.length > 0
        ? Math.round((completedLessons / courseLessons.length) * 100)
        : 0,
      averageGrade,
      totalGrades: courseGrades.length,
      totalQuizAttempts: courseQuizAttempts.length,
      totalSubmissions: courseSubmissions.length,
      totalPoints,
      maxPossiblePoints,
    };
  };

  const courseStats = calculateCourseStats();

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading course...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !course) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {error || 'Course not found'}
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

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
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
                  <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
                  {course.description && (
                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Info */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{course.lessonCount}</div>
                  <div className="text-sm text-gray-600">Total Lessons</div>
                </div>
              </div>
              {courseStats && (
                <>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {courseStats.completedLessons}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {courseStats.averageGrade}%
                      </div>
                      <div className="text-sm text-gray-600">Average Grade</div>
                    </div>
                  </div>
                </>
              )}
              {course.instructors.length > 0 && (
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-gray-900">Instructors</div>
                    <div className="text-sm text-gray-600">
                      {course.instructors.map((i) => i.name).join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {courseStats && courseStats.totalLessons > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {courseStats.completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${courseStats.completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'lessons'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Lessons ({course.lessons.length})
                </button>
                <button
                  onClick={() => setActiveTab('grades')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'grades'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Grades ({grades.filter((g) => course.lessons.some((l) => l.id === g.lessonId)).length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' ? (
                <div className="space-y-6">
                  {/* Course Description */}
                  {course.description && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Course</h3>
                      <p className="text-gray-700 leading-relaxed">{course.description}</p>
                    </div>
                  )}

                  {/* Statistics Grid */}
                  {courseStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-blue-600 font-medium">Lessons Completed</div>
                            <div className="text-2xl font-bold text-blue-900">
                              {courseStats.completedLessons} / {courseStats.totalLessons}
                            </div>
                          </div>
                          <CheckCircle className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-green-600 font-medium">Average Grade</div>
                            <div className="text-2xl font-bold text-green-900">
                              {courseStats.averageGrade}%
                            </div>
                          </div>
                          <Trophy className="h-8 w-8 text-green-600" />
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-purple-600 font-medium">Exercises Submitted</div>
                            <div className="text-2xl font-bold text-purple-900">
                              {courseStats.totalSubmissions}
                            </div>
                          </div>
                          <Code className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-yellow-600 font-medium">Quiz Attempts</div>
                            <div className="text-2xl font-bold text-yellow-900">
                              {courseStats.totalQuizAttempts}
                            </div>
                          </div>
                          <HelpCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {grades
                        .filter((g) => course.lessons.some((l) => l.id === g.lessonId))
                        .slice(0, 5)
                        .map((grade) => {
                          const lesson = course.lessons.find((l) => l.id === grade.lessonId);
                          return (
                            <div
                              key={grade.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center space-x-3">
                                <Award className="h-5 w-5 text-yellow-600" />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {lesson?.title || 'Lesson'} - Exercise Graded
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(grade.gradedAt || new Date()).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">{grade.percentage}%</div>
                                <div className="text-sm text-gray-600">{grade.letterGrade}</div>
                              </div>
                            </div>
                          );
                        })}
                      {grades.filter((g) => course.lessons.some((l) => l.id === g.lessonId)).length ===
                        0 && (
                        <div className="text-center py-8 text-gray-500">
                          No recent activity. Complete lessons and submit exercises to see your progress!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'lessons' ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons</h2>
                  {course.lessons.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons available</h3>
                      <p className="text-gray-600">Lessons for this course haven't been added yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {course.lessons.map((lesson) => {
                        const hasPassed = hasPassedQuiz(lesson.id);
                        const lessonGrade = getLessonGrade(lesson.id);
                        const isUnlocked = isLessonUnlocked(lesson);
                        const lessonSubmissions = exerciseSubmissions.filter(
                          (sub) => sub.lessonId === lesson.id
                        );

                        return (
                          <div
                            key={lesson.id}
                            className={`rounded-xl border-2 p-6 transition-all duration-300 ${
                              isUnlocked
                                ? 'border-gray-200 hover:border-blue-400 hover:shadow-xl bg-white'
                                : 'border-gray-100 bg-gray-50 opacity-75'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    isUnlocked
                                      ? hasPassed
                                        ? 'bg-green-100'
                                        : 'bg-blue-100'
                                      : 'bg-gray-200'
                                  }`}
                                >
                                  {isUnlocked ? (
                                    hasPassed ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <BookOpen className="h-5 w-5 text-blue-600" />
                                    )
                                  ) : (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-gray-500 mb-1">
                                    Lesson {lesson.number}
                                  </div>
                                  <h3 className="font-semibold text-gray-900 text-sm">{lesson.title}</h3>
                                </div>
                              </div>
                            </div>

                            {lesson.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {lesson.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                              {lesson.duration && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {lesson.duration}
                                </div>
                              )}
                              {lessonGrade && (
                                <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {lessonGrade.percentage}%
                                </div>
                              )}
                            </div>

                            {lessonSubmissions.length > 0 && (
                              <div className="mb-2 text-xs text-gray-600 flex items-center">
                                <Code className="h-3 w-3 mr-1" />
                                {lessonSubmissions.length} exercise{lessonSubmissions.length !== 1 ? 's' : ''} submitted
                              </div>
                            )}

                            <div className="space-y-2">
                              {isUnlocked ? (
                                <>
                                  <Link
                                    href={`/student/lesson/${lesson.id}`}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:shadow-lg transition-all duration-200 text-center block font-medium text-sm flex items-center justify-center"
                                  >
                                    {hasPassed ? 'Review Content' : 'Start Lesson'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                  {!hasPassed && (
                                    <Link
                                      href={`/student/quiz/${lesson.id}`}
                                      className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 text-center block font-medium text-sm"
                                    >
                                      Take Quiz
                                    </Link>
                                  )}
                                </>
                              ) : (
                                <div className="w-full bg-gray-200 text-gray-500 py-2.5 px-4 rounded-lg text-center text-sm">
                                  Complete Previous Lesson
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Grades</h2>
                  {grades.filter((g) => course.lessons.some((l) => l.id === g.lessonId)).length ===
                  0 ? (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No grades yet</h3>
                      <p className="text-gray-600">
                        Submit exercises to receive grades from your instructor.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course.lessons.map((lesson) => {
                        const lessonGrades = grades.filter((g) => g.lessonId === lesson.id);
                        if (lessonGrades.length === 0) return null;

                        return (
                          <div
                            key={lesson.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  Lesson {lesson.number}: {lesson.title}
                                </h4>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {lessonGrades.map((grade) => (
                                <div
                                  key={grade.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    <div>
                                      <div className="font-medium text-gray-900">Exercise</div>
                                      <div className="text-sm text-gray-600">
                                        {new Date(grade.gradedAt || new Date()).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <div className="text-sm text-gray-600">Score</div>
                                      <div className="font-semibold text-gray-900">
                                        {grade.totalPoints} / {grade.maxPossiblePoints}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-gray-600">Grade</div>
                                      <div className="font-bold text-blue-600">{grade.percentage}%</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-gray-600">Letter</div>
                                      <div className="font-bold text-green-600">
                                        {grade.letterGrade}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lessons */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons</h2>
            {course.lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons available</h3>
                <p className="text-gray-600">Lessons for this course haven't been added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {course.lessons.map((lesson) => {
                  const hasPassed = hasPassedQuiz(lesson.id);
                  const lessonGrade = getLessonGrade(lesson.id);
                  const isUnlocked = isLessonUnlocked(lesson);

                  return (
                    <div
                      key={lesson.id}
                      className={`rounded-xl border-2 p-6 transition-all duration-300 ${
                        isUnlocked
                          ? 'border-gray-200 hover:border-blue-400 hover:shadow-xl bg-white'
                          : 'border-gray-100 bg-gray-50 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isUnlocked
                                ? hasPassed
                                  ? 'bg-green-100'
                                  : 'bg-blue-100'
                                : 'bg-gray-200'
                            }`}
                          >
                            {isUnlocked ? (
                              hasPassed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-blue-600" />
                              )
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              Lesson {lesson.number}
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm">{lesson.title}</h3>
                          </div>
                        </div>
                      </div>

                      {lesson.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                        {lesson.duration && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {lesson.duration}
                          </div>
                        )}
                        {lessonGrade && (
                          <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                            <Trophy className="h-3 w-3 mr-1" />
                            {lessonGrade.percentage}%
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {isUnlocked ? (
                          <>
                            <Link
                              href={`/student/lesson/${lesson.id}`}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:shadow-lg transition-all duration-200 text-center block font-medium text-sm flex items-center justify-center"
                            >
                              {hasPassed ? 'Review Content' : 'Start Lesson'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            {!hasPassed && (
                              <Link
                                href={`/student/quiz/${lesson.id}`}
                                className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 text-center block font-medium text-sm"
                              >
                                Take Quiz
                              </Link>
                            )}
                          </>
                        ) : (
                          <div className="w-full bg-gray-200 text-gray-500 py-2.5 px-4 rounded-lg text-center text-sm">
                            Complete Previous Lesson
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

