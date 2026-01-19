'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { BookOpen, Users, ArrowRight, Search, Clock } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  lessonCount: number;
  subscriberCount: number;
  assignedAt: Date;
  createdAt: Date;
}

export default function InstructorCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instructor/courses');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data.courses || []);
      setFilteredCourses(data.courses || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              My Courses
            </h1>
            <p className="text-gray-600">Manage courses assigned to you</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No courses found' : 'No courses assigned'}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Contact an administrator to get assigned to courses'}
              </p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{filteredCourses.length}</div>
                      <div className="text-sm text-gray-600">Assigned Courses</div>
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
                        {filteredCourses.reduce((sum, course) => sum + course.lessonCount, 0)}
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
                      <div className="text-2xl font-bold text-gray-900">
                        {filteredCourses.reduce((sum, course) => sum + course.subscriberCount, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/instructor/courses/${course.id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        {course.isActive ? (
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Active
                          </div>
                        ) : (
                          <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                            Inactive
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.subscriberCount} {course.subscriberCount === 1 ? 'student' : 'students'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          Assigned {new Date(course.assignedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                          Manage
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

