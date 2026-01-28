'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  CheckCircle,
  Lock,
  Clock,
  Trophy,
  BarChart3,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Plus,
  X,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardSkeleton } from '@/components/Skeleton';

interface Course {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  lessons: Array<{
    id: string;
    number: number;
    title: string;
    description: string | null;
    duration: string | null;
  }>;
  lessonCount: number;
  subscriberCount: number;
  instructors: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  subscribedAt: string;
}

interface AvailableCourse {
  id: string;
  title: string;
  description: string | null;
  lessonCount: number;
  subscriberCount: number;
  isSubscribed: boolean;
}

interface Grade {
  id: string;
  lessonId: string;
  exerciseId: string;
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  letterGrade: string;
  gradedAt: string;
}

interface QuizAttempt {
  id: string;
  lessonId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string | null;
  registrationNumber: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [exerciseSubmissions, setExerciseSubmissions] = useState<Array<{ exerciseId: string; lessonId: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'lessons'>('courses');
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Fetch student profile
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/students?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.students && data.students.length > 0) {
            const student = data.students[0];
            setStudentProfile({
              id: student.id,
              name: student.name,
              email: student.email,
              registrationNumber: student.registrationNumber,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    };

    fetchStudentProfile();
  }, [session?.user?.id]);

  // Fetch dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!studentProfile) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch enrolled courses
        const coursesResponse = await fetch('/api/student/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setEnrolledCourses(coursesData.courses || []);
        }

        // Fetch available courses
        const availableResponse = await fetch('/api/courses?includeSubscribed=true');
        if (availableResponse.ok) {
          const availableData = await availableResponse.json();
          setAvailableCourses(availableData.courses || []);
        }
        
        // Fetch grades
        const gradesResponse = await fetch(`/api/grades?studentId=${studentProfile.id}`);
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          setGrades(gradesData.grades || []);
        }
        
        // Fetch quiz attempts
        const quizResponse = await fetch(`/api/quiz-attempts?studentId=${studentProfile.id}`);
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          setQuizAttempts(quizData.attempts || []);
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
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (studentProfile) {
      loadDashboardData();
    }
  }, [studentProfile]);

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      const response = await fetch('/api/student/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enroll');
      }

      // Refresh courses
      const coursesResponse = await fetch('/api/student/courses');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setEnrolledCourses(coursesData.courses || []);
      }

      const availableResponse = await fetch('/api/courses?includeSubscribed=true');
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        setAvailableCourses(availableData.courses || []);
      }

      setShowEnrollModal(false);
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error instanceof Error ? error.message : 'Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      const response = await fetch('/api/student/courses/unenroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unenroll');
      }

      // Refresh courses
      const coursesResponse = await fetch('/api/student/courses');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setEnrolledCourses(coursesData.courses || []);
      }

      const availableResponse = await fetch('/api/courses?includeSubscribed=true');
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        setAvailableCourses(availableData.courses || []);
      }
    } catch (error) {
      console.error('Error unenrolling:', error);
      alert(error instanceof Error ? error.message : 'Failed to unenroll from course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Get all lessons from enrolled courses
  const allLessons = enrolledCourses.flatMap((course) =>
    course.lessons.map((lesson) => ({
      ...lesson,
      courseId: course.id,
      courseTitle: course.title,
    }))
  );

  // Check if student has passed quiz for a lesson
  const hasPassedQuiz = (lessonId: string) => {
    const attempt = quizAttempts.find(
      (attempt) => attempt.lessonId === lessonId && attempt.passed
    );
    return !!attempt;
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
  const isLessonUnlocked = (lesson: { id: string; number: number; courseId: string }) => {
    // First lesson in a course is always unlocked
    if (lesson.number === 1) {
      return true;
    }

    // Find the previous lesson in the same course
    const courseLessons = enrolledCourses
      .find((c) => c.id === lesson.courseId)
      ?.lessons.sort((a, b) => a.number - b.number) || [];

    const previousLesson = courseLessons.find((l) => l.number === lesson.number - 1);

    if (!previousLesson) {
      // If previous lesson doesn't exist, unlock it (shouldn't happen, but be safe)
      return true;
    }

    // Lesson is unlocked if previous lesson is completed (quiz passed OR exercise submitted)
    return isLessonCompleted(previousLesson.id);
  };

  // Get student's grade for a lesson
  const getLessonGrade = (lessonId: string) => {
    const lessonGrades = grades.filter((grade) => grade.lessonId === lessonId);
    if (lessonGrades.length === 0) return null;
    
    return lessonGrades.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  };

  // Calculate overall progress
  const calculateProgress = () => {
    if (allLessons.length === 0) return 0;
    const completedLessons = allLessons.filter((lesson) =>
      hasPassedQuiz(lesson.id)
    ).length;
    return Math.round((completedLessons / allLessons.length) * 100);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardSkeleton />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !studentProfile) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {error}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const progress = calculateProgress();
  const averageGrade =
    grades.length > 0
      ? Math.round(grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length)
      : 0;

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {studentProfile?.name || session?.user?.name}
              </span>
              !
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Continue your learning journey and track your progress</p>
          </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{allLessons.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Lessons</div>
                </div>
            </div>
          </div>
          
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 dark:text-green-400" />
                </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allLessons.filter((lesson) => hasPassedQuiz(lesson.id)).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageGrade}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Average Grade</div>
              </div>
            </div>
          </div>
          
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{enrolledCourses.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Enrolled Courses</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {allLessons.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h3>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'courses'
                      ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  My Courses ({enrolledCourses.length})
                </button>
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'lessons'
                      ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  All Lessons ({allLessons.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'courses' ? (
                <div className="space-y-6">
                  {/* Enrolled Courses */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Enrolled Courses</h3>
                      <button
                        onClick={() => setShowEnrollModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Enroll in Course
                      </button>
                    </div>

                    {enrolledCourses.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No enrolled courses
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Enroll in a course to start learning, or wait for your instructor to enroll
                          you.
                        </p>
                        <button
                          onClick={() => setShowEnrollModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Browse Courses
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.map((course) => (
                          <div
                            key={course.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                  {course.title}
                                </h4>
                                {course.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                    {course.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleUnenroll(course.id)}
                                disabled={enrollingCourseId === course.id}
                                className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                                title="Unenroll"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <BookOpen className="h-4 w-4 mr-2" />
                                {course.lessonCount} lessons
                              </div>
                              {course.instructors.length > 0 && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <Users className="h-4 w-4 mr-2" />
                                  {course.instructors.map((i) => i.name).join(', ')}
          </div>
                              )}
        </div>

                            <Link
                              href={`/student/course/${course.id}`}
                              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              View Course
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* All Lessons from Enrolled Courses */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">All Lessons</h3>
                    {allLessons.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No lessons available</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Enroll in a course to access lessons, or wait for your instructor to enroll you.
                        </p>
                      </div>
                    ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allLessons.map((lesson) => {
              const hasPassed = hasPassedQuiz(lesson.id);
              const lessonGrade = getLessonGrade(lesson.id);
                          const isUnlocked = isLessonUnlocked(lesson);
              
              return (
                <div
                  key={lesson.id}
                              className={`rounded-xl border-2 p-6 transition-all duration-300 ${
                    isUnlocked
                                  ? 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-xl bg-white dark:bg-gray-800'
                                  : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      isUnlocked
                                        ? hasPassed
                                          ? 'bg-green-100 dark:bg-green-900/30'
                                          : 'bg-blue-100 dark:bg-blue-900/30'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                  >
                      {isUnlocked ? (
                        hasPassed ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )
                      ) : (
                                      <Lock className="h-5 w-5 text-gray-400" />
                      )}
                                  </div>
                      <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                      {lesson.courseTitle} • Lesson {lesson.number}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                      {lesson.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                              {lesson.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                              )}
                  
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
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
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-2.5 px-4 rounded-lg text-center text-sm">
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
              )}
            </div>
          </div>

          {/* Enroll Modal */}
          {showEnrollModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Courses</h2>
                  <button
                    onClick={() => setShowEnrollModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  {availableCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">No courses available at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableCourses.map((course) => {
                        const isEnrolled = enrolledCourses.some((c) => c.id === course.id);
                        return (
                          <div
                            key={course.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{course.title}</h4>
                                {course.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{course.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {course.lessonCount} lessons
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {course.subscriberCount} students
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                {isEnrolled ? (
                                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-full text-sm font-medium">
                                    Enrolled
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleEnroll(course.id)}
                                    disabled={enrollingCourseId === course.id}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
          </div>
        </div>
          )}
      </main>
      </div>
    </ProtectedRoute>
  );
}
