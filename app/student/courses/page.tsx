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

export default function StudentCoursesPage() {
  const { data: session } = useSession();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all');
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
          // Map courses to include enrolledByInstructor flag
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
      
      // If it's an instructor enrollment error, show it clearly
      if (errorMessage.includes('instructor')) {
        // Error is already set, no need to do anything else
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Filter courses based on search and filter
  const getFilteredCourses = () => {
    let coursesToShow: Course[] = [];

    if (filter === 'enrolled') {
      // Show enrolled courses
      coursesToShow = availableCourses.filter((course) =>
        enrolledCourses.some((ec) => ec.id === course.id)
      );
    } else if (filter === 'available') {
      // Show only available (not enrolled) courses
      coursesToShow = availableCourses.filter(
        (course) => !enrolledCourses.some((ec) => ec.id === course.id)
      );
    } else {
      // Show all courses
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

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading courses...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Courses</h1>
            <p className="text-gray-600">Browse and enroll in courses to start learning</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</div>
                  <div className="text-sm text-gray-600">Enrolled Courses</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {enrolledCourses.reduce((sum, course) => sum + course.lessonCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Lessons</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{availableCourses.length}</div>
                  <div className="text-sm text-gray-600">Available Courses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('enrolled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'enrolled'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Enrolled ({enrolledCourses.length})
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'available'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Available ({availableCourses.length - enrolledCourses.length})
                </button>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm
                  ? 'No courses found'
                  : filter === 'enrolled'
                  ? 'No enrolled courses'
                  : filter === 'available'
                  ? 'No available courses'
                  : 'No courses available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Check back later for new courses'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourses.some((ec) => ec.id === course.id);
                const enrolledCourse = enrolledCourses.find((ec) => ec.id === course.id);

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      {isEnrolled && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enrolled
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.lessonCount} lessons
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.subscriberCount} students
                        </div>
                      </div>
                      {enrolledCourse && enrolledCourse.instructors.length > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          Instructors: {enrolledCourse.instructors.map((i) => i.name).join(', ')}
                        </div>
                      )}
                      {isEnrolled && enrolledCourse && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Enrolled on {new Date(enrolledCourse.subscribedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {isEnrolled ? (
                        <>
                          <Link
                            href={`/student/course/${course.id}`}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:shadow-lg transition-all text-center block flex items-center justify-center"
                          >
                            View Course
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                          {enrolledCourse?.enrolledByInstructor ? (
                            <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-700 py-2 px-4 rounded-lg text-xs text-center">
                              Enrolled by instructor - Cannot unenroll
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUnenroll(course.id)}
                              disabled={enrollingCourseId === course.id}
                              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {enrollingCourseId === course.id ? 'Unenrolling...' : 'Unenroll'}
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingCourseId === course.id || !course.isActive}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {enrollingCourseId === course.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

