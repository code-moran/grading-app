'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ArrowRight,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  HelpCircle,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { DashboardSkeleton } from '@/components/Skeleton';

interface InstructorStats {
  totalCourses: number;
  totalLessons: number;
  totalExercises: number;
  totalSubscribers: number;
  totalGrades: number;
  totalQuizAttempts: number;
  totalQuizQuestions: number;
}

interface RecentCourse {
  id: string;
  title: string;
  lessonCount: number;
  subscriberCount: number;
}

interface LessonNeedingGrading {
  id: string;
  number: number;
  title: string;
  courseId: string;
  courseTitle: string;
  exerciseCount: number;
  gradedCount: number;
}

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [lessonsNeedingGrading, setLessonsNeedingGrading] = useState<LessonNeedingGrading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/instructor/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data.stats);
        setRecentCourses(data.recentCourses || []);
        setLessonsNeedingGrading(data.lessonsNeedingGrading || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{session?.user?.name}</span>!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your courses and track student progress</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">{stats?.totalCourses || 0}</div>
                  <div className="text-blue-100 text-sm mt-1">Assigned Courses</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">{stats?.totalLessons || 0}</div>
                  <div className="text-green-100 text-sm mt-1">Total Lessons</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">{stats?.totalSubscribers || 0}</div>
                  <div className="text-purple-100 text-sm mt-1">Active Subscribers</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <ClipboardList className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold">{stats?.totalExercises || 0}</div>
                  <div className="text-orange-100 text-sm mt-1">Total Exercises</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalGrades || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Grades Submitted</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                      <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalQuizQuestions || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Quiz Questions</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalQuizAttempts || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Quiz Attempts</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link
              href="/instructor/students"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Students</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Manage in-class students</div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                View all
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/instructor/courses"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
            >
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Courses</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Manage assigned courses</div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                View all
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/instructor/grades"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
            >
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Grades</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">View reports</div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                View all
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/settings"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
            >
              <div className="flex items-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Settings</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Configure</div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                View all
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-100 dark:border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                  </div>
                </div>

                {lessonsNeedingGrading.length > 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                      Lessons Needing Grading ({lessonsNeedingGrading.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {lessonsNeedingGrading.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/instructor/lesson/${lesson.id}`}
                          className="p-6 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all duration-200 group bg-white dark:bg-gray-800/50"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">Lesson {lesson.number}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.courseTitle}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{lesson.title}</p>
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>
                              {lesson.gradedCount} / {lesson.exerciseCount} graded
                            </span>
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                              {Math.round((lesson.gradedCount / lesson.exerciseCount) * 100)}% complete
                            </span>
                          </div>
                          <div className="mt-4 flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Grade now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 dark:text-green-400" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm">No lessons currently need grading.</p>
                  </div>
                )}

              </div>

              {/* Recent Courses */}
              {recentCourses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Courses</h2>
                    </div>
                    <Link
                      href="/instructor/courses"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                    >
                      View all
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/instructor/courses/${course.id}`}
                        className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 group bg-white dark:bg-gray-800/50"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                            {course.lessonCount} lessons
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                            {course.subscriberCount} subscribers
                          </span>
                        </div>
                        <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View course
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}