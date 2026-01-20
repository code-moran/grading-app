'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  approvedInstructors: number;
  pendingInstructors: number;
  totalCourses: number;
  activeCourses: number;
  totalSubscriptions: number;
}

interface RecentRegistration {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStats(data.stats);
      setRecentRegistrations(data.recentRegistrations || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if ((session?.user as any)?.role !== 'admin') {
    return (
      <ProtectedRoute requiredRole="admin">
        <div>Unauthorized</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold">{session?.user?.name}</span>. Manage your platform from here.
            </p>
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
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <UserPlus className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{stats?.totalInstructors || 0}</div>
                      <div className="text-sm text-gray-600">Instructors</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{stats?.activeCourses || 0}</div>
                      <div className="text-sm text-gray-600">Active Courses</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert for Pending Instructors */}
              {stats && stats.pendingInstructors > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900">
                        {stats.pendingInstructors} Pending Instructor{stats.pendingInstructors !== 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Review and approve instructor applications
                      </p>
                    </div>
                    <Link
                      href="/admin/instructors"
                      className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
                    >
                      Review Now
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Link
                  href="/admin/instructors"
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Instructor Approvals</h3>
                      <p className="text-sm text-gray-600">
                        {stats?.pendingInstructors || 0} pending
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    Manage approvals
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/courses"
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Course Management</h3>
                      <p className="text-sm text-gray-600">
                        {stats?.activeCourses || 0} active courses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    Manage courses
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/students"
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Student Management</h3>
                      <p className="text-sm text-gray-600">
                        {stats?.totalStudents || 0} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    Manage students
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/instructor/grades"
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Grade Reports</h3>
                      <p className="text-sm text-gray-600">View all grades</p>
                    </div>
                  </div>
                  <div className="flex items-center text-indigo-600 text-sm font-medium">
                    View reports
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  href="/admin/courses"
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">Lesson Management</h3>
                      <p className="text-sm text-gray-600">Manage course content</p>
                    </div>
                  </div>
                  <div className="flex items-center text-orange-600 text-sm font-medium">
                    Manage lessons
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">System Settings</h3>
                      <p className="text-sm text-gray-600">Platform configuration</p>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm font-medium">
                    Coming soon
                  </div>
                </div>
              </div>

              {/* Recent Registrations */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
                  <Link
                    href="/admin/users"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </Link>
                </div>
                {recentRegistrations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent registrations</p>
                ) : (
                  <div className="space-y-3">
                    {recentRegistrations.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              user.role === 'student'
                                ? 'bg-green-100'
                                : user.role === 'instructor'
                                ? 'bg-purple-100'
                                : 'bg-blue-100'
                            }`}
                          >
                            {user.role === 'student' ? (
                              <GraduationCap className="h-4 w-4 text-green-600" />
                            ) : user.role === 'instructor' ? (
                              <UserPlus className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Settings className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'student'
                                ? 'bg-green-100 text-green-700'
                                : user.role === 'instructor'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {user.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-100">Total Subscriptions</span>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold">{stats?.totalSubscriptions || 0}</div>
                  <div className="text-blue-100 text-sm mt-1">Active course enrollments</div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-100">Approved Instructors</span>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold">{stats?.approvedInstructors || 0}</div>
                  <div className="text-green-100 text-sm mt-1">Active instructors</div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-100">Total Courses</span>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold">{stats?.totalCourses || 0}</div>
                  <div className="text-purple-100 text-sm mt-1">All courses created</div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

