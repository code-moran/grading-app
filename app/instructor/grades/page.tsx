'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Download,
  Filter,
  Search,
  Calendar,
  Award,
  FileText,
  ArrowLeft,
  X,
  PieChart,
  LineChart,
} from 'lucide-react';
import Link from 'next/link';

interface Grade {
  id: string;
  studentId: string;
  lessonId: string;
  exerciseId: string;
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  letterGrade: string;
  // TVETA/CBET Compliance Fields
  isCompetent?: boolean | null;
  competencyStatus?: 'competent' | 'not_competent' | 'needs_improvement' | null;
  assessorId?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  feedback: string | null;
  gradedBy: string;
  gradedAt: string;
  student?: {
    id: string;
    name: string;
    registrationNumber: string;
  };
  lesson?: {
    id: string;
    number: number;
    title: string;
    courseId: string;
    course?: {
      id: string;
      title: string;
    };
  };
  exercise?: {
    id: string;
    title: string;
    maxPoints: number;
  };
}

interface Analytics {
  totalGrades: number;
  averagePercentage: number;
  averagePoints: number;
  totalPoints: number;
  maxPossiblePoints: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  trends: Array<{
    week: string;
    count: number;
    averagePercentage: number;
  }>;
  courseStats: Array<{
    courseId: string;
    courseName: string;
    totalGrades: number;
    averagePercentage: number;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  }>;
  lessonStats: Array<{
    lessonId: string;
    lessonNumber: number;
    lessonTitle: string;
    totalGrades: number;
    averagePercentage: number;
  }>;
  studentStats: Array<{
    studentId: string;
    studentName: string;
    registrationNumber: string;
    totalGrades: number;
    averagePercentage: number;
    totalPoints: number;
    maxPossiblePoints: number;
  }>;
}

export default function InstructorGradesPage() {
  const { data: session } = useSession();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  
  // Export filters
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    courseId: 'all',
    lessonId: 'all',
    studentId: 'all',
    exerciseId: 'all',
    cohortId: 'all',
    startDate: '',
    endDate: '',
    minPercentage: '',
    maxPercentage: '',
    letterGrade: 'all',
  });
  const [exporting, setExporting] = useState(false);
  const [lessons, setLessons] = useState<Array<{ id: string; number: number; title: string; courseId: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; registrationNumber: string }>>([]);
  const [exercises, setExercises] = useState<Array<{ id: string; title: string; lessonId: string }>>([]);
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string; description: string | null }>>([]);

  useEffect(() => {
    fetchData();
  }, [selectedCourse, selectedLesson, selectedStudent]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (selectedCourse !== 'all') {
        params.append('courseId', selectedCourse);
      }
      if (selectedLesson !== 'all') {
        params.append('lessonId', selectedLesson);
      }
      if (selectedStudent !== 'all') {
        params.append('studentId', selectedStudent);
      }

      // Fetch grades and analytics in parallel
      const [gradesResponse, analyticsResponse, coursesResponse, studentsResponse, cohortsResponse] = await Promise.all([
        fetch(`/api/grades?${params.toString()}`),
        fetch(`/api/grades/analytics?${params.toString()}`),
        fetch('/api/courses'),
        fetch('/api/students'),
        fetch('/api/cohorts'),
      ]);

      if (!gradesResponse.ok || !analyticsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const gradesData = await gradesResponse.json();
      const analyticsData = await analyticsResponse.json();
      const coursesData = await coursesResponse.json();
      const studentsData = await studentsResponse.json();
      const cohortsData = await cohortsResponse.json();

      setGrades(gradesData.grades || []);
      setAnalytics(analyticsData.analytics);
      setCourses(coursesData.courses || []);
      setStudents(studentsData.students || []);
      setCohorts(cohortsData.cohorts || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      !searchTerm ||
      grade.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.exercise?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.lesson?.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const fetchLessonsForCourse = async (courseId: string) => {
    if (courseId === 'all') {
      setLessons([]);
      setExercises([]);
      return;
    }
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        const courseLessons = data.course?.lessons || [];
        setLessons(courseLessons);
        
        // Fetch exercises for all lessons
        const allExercises: any[] = [];
        for (const lesson of courseLessons) {
          const lessonResponse = await fetch(`/api/lessons/${lesson.id}`);
          if (lessonResponse.ok) {
            const lessonData = await lessonResponse.json();
            if (lessonData.lesson?.exercises) {
              allExercises.push(...lessonData.lesson.exercises.map((ex: any) => ({
                ...ex,
                lessonId: lesson.id,
              })));
            }
          }
        }
        setExercises(allExercises);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  useEffect(() => {
    if (exportFilters.courseId !== 'all') {
      fetchLessonsForCourse(exportFilters.courseId);
    } else {
      setLessons([]);
      setExercises([]);
    }
  }, [exportFilters.courseId]);

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Build query params from export filters
      const params = new URLSearchParams();
      if (exportFilters.courseId !== 'all') {
        params.append('courseId', exportFilters.courseId);
      }
      if (exportFilters.lessonId !== 'all') {
        params.append('lessonId', exportFilters.lessonId);
      }
      if (exportFilters.studentId !== 'all') {
        params.append('studentId', exportFilters.studentId);
      }
      if (exportFilters.exerciseId !== 'all') {
        params.append('exerciseId', exportFilters.exerciseId);
      }
      if (exportFilters.cohortId !== 'all') {
        params.append('cohortId', exportFilters.cohortId);
      }
      if (exportFilters.startDate) {
        params.append('startDate', exportFilters.startDate);
      }
      if (exportFilters.endDate) {
        params.append('endDate', exportFilters.endDate);
      }
      if (exportFilters.minPercentage) {
        params.append('minPercentage', exportFilters.minPercentage);
      }
      if (exportFilters.maxPercentage) {
        params.append('maxPercentage', exportFilters.maxPercentage);
      }
      if (exportFilters.letterGrade !== 'all') {
        params.append('letterGrade', exportFilters.letterGrade);
      }

      const response = await fetch(`/api/grades/export?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      const data = await response.json();
      const csvContent = convertToCSV(data.data);
      
      // Generate filename with filter info
      const dateStr = new Date().toISOString().split('T')[0];
      let filename = `grades-export-${dateStr}`;
      if (exportFilters.courseId !== 'all') {
        const course = courses.find(c => c.id === exportFilters.courseId);
        if (course) {
          filename += `-${course.title.replace(/\s+/g, '-')}`;
        }
      }
      filename += '.csv';
      
      downloadCSV(csvContent, filename);
      setShowExportModal(false);
      
      // Show success message
      alert(`Successfully exported ${data.data.length} student${data.data.length !== 1 ? 's' : ''} with ${data.data.reduce((sum: number, s: any) => sum + s.grades.length, 0)} grade${data.data.reduce((sum: number, s: any) => sum + s.grades.length, 0) !== 1 ? 's' : ''}`);
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error.message || 'Failed to export grades');
    } finally {
      setExporting(false);
    }
  };

  const handleUseCurrentFilters = () => {
    setExportFilters({
      courseId: selectedCourse,
      lessonId: selectedLesson,
      studentId: selectedStudent,
      exerciseId: 'all',
      cohortId: 'all',
      startDate: '',
      endDate: '',
      minPercentage: '',
      maxPercentage: '',
      letterGrade: 'all',
    });
  };

  const convertToCSV = (data: any[]) => {
    const headers = [
      'Student Name', 
      'Registration Number', 
      'Email', 
      'Cohort', 
      'Course', 
      'KNQF Level',
      'Qualification Code',
      'Unit Standard Code',
      'Unit Standard Title',
      'Competency Unit Code',
      'Competency Unit Title',
      'Lesson', 
      'Exercise', 
      'Points', 
      'Max Points', 
      'Percentage', 
      'Letter Grade',
      'Competency Status',
      'Is Competent',
      'Assessor Name',
      'Assessor Accreditation',
      'Verified By',
      'Verified At',
      'Moderated By',
      'Moderated At',
      'Feedback', 
      'Graded By', 
      'Date'
    ];
    const rows = data.flatMap((student) =>
      student.grades.map((grade: any) => [
        escapeCSV(student.studentName),
        escapeCSV(student.registrationNumber),
        escapeCSV(student.email || ''),
        escapeCSV(student.cohortName || ''),
        escapeCSV(grade.courseTitle || ''),
        grade.knqfLevel || '',
        escapeCSV(grade.qualificationCode || ''),
        escapeCSV(grade.unitStandardCode || ''),
        escapeCSV(grade.unitStandardTitle || ''),
        escapeCSV(grade.competencyUnitCode || ''),
        escapeCSV(grade.competencyUnitTitle || ''),
        escapeCSV(grade.lessonTitle),
        escapeCSV(grade.exerciseTitle),
        grade.points,
        grade.maxPoints,
        grade.percentage,
        grade.letterGrade,
        escapeCSV(grade.competencyStatus || ''),
        grade.isCompetent ? 'Yes' : 'No',
        escapeCSV(grade.assessorName || ''),
        escapeCSV(grade.assessorAccreditation || ''),
        escapeCSV(grade.verifiedBy || ''),
        grade.verifiedAt ? new Date(grade.verifiedAt).toLocaleDateString() : '',
        escapeCSV(grade.moderatedBy || ''),
        grade.moderatedAt ? new Date(grade.moderatedAt).toLocaleDateString() : '',
        escapeCSV(grade.feedback || ''),
        escapeCSV(grade.gradedBy || 'Instructor'),
        new Date(grade.gradedAt).toLocaleDateString(),
      ])
    );
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const escapeCSV = (value: string) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['instructor', 'admin']}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading grades...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/instructor"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Grades Management</h1>
                <p className="text-gray-600 mt-1">View and analyze student performance</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="mb-6 bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search students, exercises..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lesson</label>
                  <select
                    value={selectedLesson}
                    onChange={(e) => setSelectedLesson(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Lessons</option>
                    {/* Lessons would be populated based on selected course */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Students</option>
                    {/* Students would be populated */}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{analytics.totalGrades}</div>
                      <div className="text-sm text-gray-600">Total Grades</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{analytics.averagePercentage}%</div>
                      <div className="text-sm text-gray-600">Average Grade</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {analytics.totalPoints} / {analytics.maxPossiblePoints}
                      </div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Set(grades.map((g) => g.studentId)).size}
                      </div>
                      <div className="text-sm text-gray-600">Students Graded</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grade Distribution Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Grade Distribution
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(analytics.gradeDistribution).map(([grade, count]) => {
                      const total = analytics.totalGrades;
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={grade} className="text-center">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getGradeColor(grade === 'A' ? 95 : grade === 'B' ? 85 : grade === 'C' ? 75 : grade === 'D' ? 65 : 50)}`}>
                            {grade}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-500">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Course Statistics */}
                {analytics.courseStats.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Course Performance
                    </h3>
                    <div className="space-y-3">
                      {analytics.courseStats.slice(0, 5).map((course) => (
                        <div key={course.courseId}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">{course.courseName}</span>
                            <span className="text-sm font-semibold text-gray-700">{course.averagePercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.averagePercentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Grades Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Grades ({filteredGrades.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course / Lesson
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exercise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Competency Status</span>
                        <div className="group relative">
                          <span className="text-gray-400 cursor-help">ℹ️</span>
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            TVETA/CBET: Competency status indicates if student has demonstrated required skills. ≥70% = Competent.
                          </div>
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.student?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.student?.registrationNumber || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.lesson?.course?.title || 'Unknown Course'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Lesson {grade.lesson?.number}: {grade.lesson?.title || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {grade.exercise?.title || 'Unknown Exercise'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grade.totalPoints} / {grade.exercise?.maxPoints || grade.maxPossiblePoints}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade.percentage)}`}>
                            {grade.letterGrade}
                          </span>
                          <span className="text-sm text-gray-600">({grade.percentage}%)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grade.competencyStatus ? (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              grade.competencyStatus === 'competent'
                                ? 'bg-green-100 text-green-800'
                                : grade.competencyStatus === 'needs_improvement'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {grade.competencyStatus === 'competent'
                              ? '✓ Competent'
                              : grade.competencyStatus === 'needs_improvement'
                              ? '⚠ Needs Improvement'
                              : '✗ Not Competent'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not assessed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.gradedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedGrade(grade)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredGrades.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No grades found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Grade Detail Modal */}
        {selectedGrade && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGrade(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Grade Details</h2>
                <button
                  onClick={() => setSelectedGrade(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedGrade.exercise?.title || 'Exercise'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedGrade.lesson?.course?.title} • Lesson {selectedGrade.lesson?.number}: {selectedGrade.lesson?.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Student: {selectedGrade.student?.name} ({selectedGrade.student?.registrationNumber})
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Points</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedGrade.totalPoints} / {selectedGrade.exercise?.maxPoints || selectedGrade.maxPossiblePoints}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Percentage</div>
                    <div className={`text-2xl font-bold ${getGradeColor(selectedGrade.percentage).split(' ')[0]}`}>
                      {selectedGrade.percentage}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Letter Grade</div>
                    <div className={`text-2xl font-bold ${getGradeColor(selectedGrade.percentage).split(' ')[0]}`}>
                      {selectedGrade.letterGrade}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Graded By</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedGrade.gradedBy}</div>
                  </div>
                  {selectedGrade.competencyStatus && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Competency Status</div>
                      <div className={`text-lg font-semibold ${
                        selectedGrade.competencyStatus === 'competent'
                          ? 'text-green-600'
                          : selectedGrade.competencyStatus === 'needs_improvement'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {selectedGrade.competencyStatus === 'competent'
                          ? '✓ Competent'
                          : selectedGrade.competencyStatus === 'needs_improvement'
                          ? '⚠ Needs Improvement'
                          : '✗ Not Competent'}
                      </div>
                    </div>
                  )}
                </div>
                {selectedGrade.feedback && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedGrade.feedback}</p>
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Graded on {new Date(selectedGrade.gradedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => !exporting && setShowExportModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Export Grades</h2>
                <button
                  onClick={() => !exporting && setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={exporting}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-600">
                    Configure filters to export specific grades. Leave filters empty to export all grades.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUseCurrentFilters}
                      disabled={exporting}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Use Current Filters
                    </button>
                    <button
                      onClick={() => {
                        setExportFilters({
                          courseId: 'all',
                          lessonId: 'all',
                          studentId: 'all',
                          exerciseId: 'all',
                          cohortId: 'all',
                          startDate: '',
                          endDate: '',
                          minPercentage: '',
                          maxPercentage: '',
                          letterGrade: 'all',
                        });
                      }}
                      disabled={exporting}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Course Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <select
                      value={exportFilters.courseId}
                      onChange={(e) => {
                        setExportFilters({ ...exportFilters, courseId: e.target.value, lessonId: 'all', exerciseId: 'all' });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={exporting}
                    >
                      <option value="all">All Courses</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lesson Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson
                    </label>
                    <select
                      value={exportFilters.lessonId}
                      onChange={(e) => {
                        setExportFilters({ ...exportFilters, lessonId: e.target.value, exerciseId: 'all' });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={exporting || exportFilters.courseId === 'all'}
                    >
                      <option value="all">All Lessons</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          Lesson {lesson.number}: {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exercise Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercise
                    </label>
                    <select
                      value={exportFilters.exerciseId}
                      onChange={(e) => setExportFilters({ ...exportFilters, exerciseId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={exporting || exportFilters.lessonId === 'all'}
                    >
                      <option value="all">All Exercises</option>
                      {exercises
                        .filter((ex) => exportFilters.lessonId === 'all' || ex.lessonId === exportFilters.lessonId)
                        .map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Student Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student
                    </label>
                    <select
                      value={exportFilters.studentId}
                      onChange={(e) => setExportFilters({ ...exportFilters, studentId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={exporting}
                    >
                      <option value="all">All Students</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.registrationNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cohort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cohort
                    </label>
                    <select
                      value={exportFilters.cohortId}
                      onChange={(e) => {
                        setExportFilters({ ...exportFilters, cohortId: e.target.value, studentId: 'all' });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={exporting}
                    >
                      <option value="all">All Cohorts</option>
                      {cohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={exportFilters.startDate}
                        onChange={(e) => setExportFilters({ ...exportFilters, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={exporting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={exportFilters.endDate}
                        onChange={(e) => setExportFilters({ ...exportFilters, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={exporting}
                      />
                    </div>
                  </div>

                  {/* Percentage Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={exportFilters.minPercentage}
                        onChange={(e) => setExportFilters({ ...exportFilters, minPercentage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        disabled={exporting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={exportFilters.maxPercentage}
                        onChange={(e) => setExportFilters({ ...exportFilters, maxPercentage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="100"
                        disabled={exporting}
                      />
                    </div>
                  </div>

                  {/* Letter Grade Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Letter Grade
                    </label>
                    <select
                      value={exportFilters.letterGrade}
                      onChange={(e) => setExportFilters({ ...exportFilters, letterGrade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={exporting}
                    >
                      <option value="all">All Grades</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowExportModal(false)}
                    disabled={exporting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {exporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
