'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { BookOpen, CheckCircle, Plus, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  lessonCount: number;
  subscriberCount: number;
  isSubscribed: boolean;
  createdAt: Date;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses?includeSubscribed=true');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (courseId: string) => {
    try {
      setSubscribing(courseId);
      const response = await fetch('/api/courses/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      // Update local state
      setCourses(
        courses.map((course) =>
          course.id === courseId
            ? { ...course, isSubscribed: true, subscriberCount: course.subscriberCount + 1 }
            : course
        )
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Available Courses
            </h1>
            <p className="text-gray-600">Browse and subscribe to courses</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Available</h3>
              <p className="text-gray-600">Check back later for new courses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    {course.isSubscribed && (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Subscribed
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.lessonCount} lessons
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.subscriberCount} students
                    </div>
                  </div>

                  {course.isSubscribed ? (
                    <Link
                      href="/student"
                      className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition-all text-center block flex items-center justify-center"
                    >
                      Go to Course
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(course.id)}
                      disabled={subscribing === course.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {subscribing === course.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Subscribe
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

