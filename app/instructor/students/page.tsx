'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  BookOpen,
  BarChart3,
  Mail,
  User,
  FileText,
  TrendingUp,
  Award,
  ArrowRight,
  Eye,
  X,
} from 'lucide-react';

interface StudentCourse {
  id: string;
  title: string;
  subscribedAt: string;
}

interface StudentStats {
  totalGrades: number;
  totalQuizAttempts: number;
  totalSubmissions: number;
  averageGrade: number;
}

interface RecentGrade {
  id: string;
  lesson: {
    id: string;
    number: number;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  exercise: {
    id: string;
    title: string;
  };
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  letterGrade: string;
  gradedAt: string;
}

interface InstructorStudent {
  id: string;
  userId: string;
  name: string;
  email?: string;
  registrationNumber: string;
  cohortId?: string;
  cohort?: {
    id: string;
    name: string;
  };
  courses: StudentCourse[];
  stats: StudentStats;
  recentGrades: RecentGrade[];
}

interface Course {
  id: string;
  title: string;
}

export default function InstructorStudentsPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<InstructorStudent | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch courses first
        const coursesResponse = await fetch('/api/instructor/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses || []);
        }

        // Fetch students
        const url = selectedCourseId
          ? `/api/instructor/students?courseId=${selectedCourseId}`
          : '/api/instructor/students';
        const studentsResponse = await fetch(url);
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCourseId]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getLetterGradeColor = (letter: string) => {
    if (['A+', 'A', 'A-'].includes(letter)) return 'text-green-600';
    if (['B+', 'B', 'B-'].includes(letter)) return 'text-blue-600';
    if (['C+', 'C', 'C-'].includes(letter)) return 'text-yellow-600';
    if (['D+', 'D', 'D-'].includes(letter)) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Student Management
            </h1>
            <p className="text-gray-600">Manage and track your students by cohort</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">{filteredStudents.length}</div>
              <div className="text-blue-100 text-sm mt-1">Total Students</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">
                {filteredStudents.length > 0
                  ? Math.round(
                      filteredStudents.reduce((sum, s) => sum + s.stats.averageGrade, 0) /
                        filteredStudents.length
                    )
                  : 0}
                %
              </div>
              <div className="text-green-100 text-sm mt-1">Average Grade</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">
                {filteredStudents.reduce((sum, s) => sum + s.stats.totalGrades, 0)}
              </div>
              <div className="text-purple-100 text-sm mt-1">Total Grades</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">
                {filteredStudents.reduce((sum, s) => sum + s.stats.totalQuizAttempts, 0)}
              </div>
              <div className="text-orange-100 text-sm mt-1">Quiz Attempts</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => setSelectedCourseId(e.target.value || null)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student List */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCourseId
                  ? 'Try adjusting your search or filter criteria'
                  : 'No students are enrolled in your courses yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {student.email || 'No email'}
                            </span>
                            <span>Reg: {student.registrationNumber}</span>
                            {student.cohort && (
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Cohort: {student.cohort.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </div>

                      {/* Courses */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {student.courses.map((course) => (
                            <span
                              key={course.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              {course.title}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Average Grade</div>
                          <div
                            className={`text-2xl font-bold ${getGradeColor(student.stats.averageGrade)} px-2 py-1 rounded`}
                          >
                            {student.stats.averageGrade}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Grades</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {student.stats.totalGrades}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Quiz Attempts</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {student.stats.totalQuizAttempts}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Submissions</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {student.stats.totalSubmissions}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Grades Preview */}
                  {student.recentGrades.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Recent Grades</div>
                      <div className="flex flex-wrap gap-2">
                        {student.recentGrades.slice(0, 3).map((grade) => (
                          <div
                            key={grade.id}
                            className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg"
                          >
                            <span className="text-xs text-gray-600">
                              {grade.lesson.course.title} - Lesson {grade.lesson.number}
                            </span>
                            <span
                              className={`text-sm font-bold ${getLetterGradeColor(grade.letterGrade)}`}
                            >
                              {grade.letterGrade}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({grade.totalPoints}/{grade.maxPossiblePoints})
                            </span>
                          </div>
                        ))}
                        {student.recentGrades.length > 3 && (
                          <span className="text-xs text-gray-500 flex items-center">
                            +{student.recentGrades.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Student Detail Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Student Info */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedStudent.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Registration</div>
                        <div className="font-semibold text-gray-900">
                          {selectedStudent.registrationNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-semibold text-gray-900">
                          {selectedStudent.email || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Cohort</div>
                        <div className="font-semibold text-gray-900">
                          {selectedStudent.cohort?.name || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Enrolled Courses</h3>
                    <div className="space-y-2">
                      {selectedStudent.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="font-medium text-gray-900">{course.title}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            Since {new Date(course.subscribedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Grades */}
                  {selectedStudent.recentGrades.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Grades</h3>
                      <div className="space-y-3">
                        {selectedStudent.recentGrades.map((grade) => (
                          <div
                            key={grade.id}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {grade.lesson.course.title} - Lesson {grade.lesson.number}:{' '}
                                  {grade.lesson.title}
                                </div>
                                <div className="text-sm text-gray-600">{grade.exercise.title}</div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-bold ${getLetterGradeColor(grade.letterGrade)}`}
                                >
                                  {grade.letterGrade}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {grade.totalPoints}/{grade.maxPossiblePoints} ({grade.percentage}%)
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Graded on {new Date(grade.gradedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
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

