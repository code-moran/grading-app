'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  CheckCircle,
  Plus,
  ArrowRight,
  Users,
  Search,
  Filter,
  X,
  GraduationCap,
  Clock,
  Trophy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Play,
  Award,
} from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  lessonCount: number;
  subscriberCount: number;
  isSubscribed: boolean;
  createdAt: string;
  instructors?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  lessonCount: number;
  instructors: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  subscribedAt: string;
  enrolledByInstructor?: boolean;
}

// Skeleton Loader Component
function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg w-12 h-12"></div>
        <div className="bg-gray-200 dark:bg-gray-700 w-20 h-6 rounded-full"></div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded w-3/4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-full"></div>
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-2/3"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 h-10 rounded-lg"></div>
    </div>
  );
}

// Expandable Course Card Component
function CourseCard({
  course,
  isEnrolled,
  enrolledCourse,
  enrollingCourseId,
  onEnroll,
  onUnenroll,
}: {
  course: Course;
  isEnrolled: boolean;
  enrolledCourse?: EnrolledCourse;
  enrollingCourseId: string | null;
  onEnroll: (courseId: string) => void;
  onUnenroll: (courseId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
        isEnrolled ? 'ring-2 ring-green-200' : 'hover:shadow-xl hover:scale-[1.02]'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-sm">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            {isEnrolled && (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                Enrolled
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:text-blue-400 transition-colors">
          {course.title}
        </h3>

        {course.description && (
          <p className={`text-gray-600 dark:text-gray-300 text-sm mb-4 transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
            {course.description}
          </p>
        )}

        {/* Quick Stats - Always Visible */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">{course.lessonCount}</span>
            <span className="text-gray-500 dark:text-gray-400">lessons</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{course.subscriberCount}</span>
            <span className="text-gray-500 dark:text-gray-400">students</span>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 mb-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
            {enrolledCourse && enrolledCourse.instructors.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Users className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Instructors: </span>
                  <span>{enrolledCourse.instructors.map((i) => i.name).join(', ')}</span>
                </div>
              </div>
            )}
            {isEnrolled && enrolledCourse && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>
                  Enrolled on <span className="font-medium">{new Date(enrolledCourse.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
              </div>
            )}
            {!isEnrolled && course.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>
                  Added <span className="font-medium">{new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isEnrolled ? (
            <>
              <Link
                href={`/student/course/${course.id}`}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all text-center block flex items-center justify-center gap-2 group"
              >
                <Play className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                Continue Learning
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              {enrolledCourse?.enrolledByInstructor ? (
                <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 py-2 px-4 rounded-lg text-xs text-center font-medium">
                  Enrolled by instructor
                </div>
              ) : (
                <button
                  onClick={() => onUnenroll(course.id)}
                  disabled={enrollingCourseId === course.id}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {enrollingCourseId === course.id ? 'Unenrolling...' : 'Unenroll'}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              disabled={enrollingCourseId === course.id || !course.isActive}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enrollingCourseId === course.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enrolling...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Enroll Now
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCoursesPage() {
  const { data: session } = useSession();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [studentProfile, setStudentProfile] = useState<{ id: string } | null>(null);

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

  // Fetch courses
  useEffect(() => {
    const loadCourses = async () => {
      if (!studentProfile) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch enrolled courses
        const enrolledResponse = await fetch('/api/student/courses');
        if (enrolledResponse.ok) {
          const enrolledData = await enrolledResponse.json();
          setEnrolledCourses(
            (enrolledData.courses || []).map((course: any) => ({
              ...course,
              enrolledByInstructor: course.enrolledByInstructor || false,
            }))
          );
        }

        // Fetch all available courses
        const availableResponse = await fetch('/api/courses?includeSubscribed=true');
        if (availableResponse.ok) {
          const availableData = await availableResponse.json();
          setAvailableCourses(availableData.courses || []);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (studentProfile) {
      loadCourses();
    }
  }, [studentProfile]);

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      setError(null);

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
      const enrolledResponse = await fetch('/api/student/courses');
      if (enrolledResponse.ok) {
        const enrolledData = await enrolledResponse.json();
        setEnrolledCourses(
          (enrolledData.courses || []).map((course: any) => ({
            ...course,
            enrolledByInstructor: course.enrolledByInstructor || false,
          }))
        );
      }

      const availableResponse = await fetch('/api/courses?includeSubscribed=true');
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        setAvailableCourses(availableData.courses || []);
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      setError(error instanceof Error ? error.message : 'Failed to enroll in course');
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
      setError(null);

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
      const enrolledResponse = await fetch('/api/student/courses');
      if (enrolledResponse.ok) {
        const enrolledData = await enrolledResponse.json();
        setEnrolledCourses(
          (enrolledData.courses || []).map((course: any) => ({
            ...course,
            enrolledByInstructor: course.enrolledByInstructor || false,
          }))
        );
      }

      const availableResponse = await fetch('/api/courses?includeSubscribed=true');
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        setAvailableCourses(availableData.courses || []);
      }
    } catch (error) {
      console.error('Error unenrolling:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unenroll from course';
      setError(errorMessage);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Filter courses based on search and filter
  const getFilteredCourses = () => {
    let coursesToShow: Course[] = [];

    if (filter === 'enrolled') {
      coursesToShow = availableCourses.filter((course) =>
        enrolledCourses.some((ec) => ec.id === course.id)
      );
    } else if (filter === 'available') {
      coursesToShow = availableCourses.filter(
        (course) => !enrolledCourses.some((ec) => ec.id === course.id)
      );
    } else {
      coursesToShow = availableCourses;
    }

    // Apply search filter
    if (searchTerm) {
      coursesToShow = coursesToShow.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description &&
            course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return coursesToShow;
  };

  const filteredCourses = getFilteredCourses();
  const totalLessons = enrolledCourses.reduce((sum, course) => sum + course.lessonCount, 0);
  const availableCount = availableCourses.length - enrolledCourses.length;

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with improved typography */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-sm">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">My Courses</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Discover and manage your learning journey</p>
          </div>

          {/* Error Message with better styling */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-400 hover:text-red-900 p-1 rounded hover:bg-red-100 dark:bg-red-900/20 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Statistics Cards with improved design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{enrolledCourses.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Enrolled Courses</div>
                  </div>
                </div>
                {enrolledCourses.length > 0 && (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalLessons}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Lessons</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{availableCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Available Courses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter with progressive disclosure */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search courses by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-700">Filters</span>
                </button>
              </div>

              {/* Filter buttons - visible on desktop, collapsible on mobile */}
              <div className={`flex flex-wrap items-center gap-2 transition-all duration-300 ${showFilters ? 'block' : 'hidden md:flex'}`}>
                <Filter className="h-5 w-5 text-gray-400 hidden md:block" />
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  All Courses
                </button>
                <button
                  onClick={() => setFilter('enrolled')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === 'enrolled'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Enrolled ({enrolledCourses.length})
                  </span>
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === 'available'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Available ({availableCount})
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Courses Grid with skeleton loaders */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {searchTerm
                    ? 'No courses found'
                    : filter === 'enrolled'
                    ? 'No enrolled courses yet'
                    : filter === 'available'
                    ? 'No available courses'
                    : 'No courses available'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms or browse all courses'
                    : filter === 'enrolled'
                    ? 'Start by enrolling in a course to begin your learning journey'
                    : 'Check back later for new courses'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourses.some((ec) => ec.id === course.id);
                const enrolledCourse = enrolledCourses.find((ec) => ec.id === course.id);

                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={isEnrolled}
                    enrolledCourse={enrolledCourse}
                    enrollingCourseId={enrollingCourseId}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
