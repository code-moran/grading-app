'use client';

import { useState, useEffect } from 'react';
import { lessons } from '@/lib/lessons';
import { Grade, Student, BulkGradeExport } from '@/lib/types';
import { BarChart3, TrendingUp, Users, BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { convertGradesToCSV, downloadCSV, calculateBestGrade } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TableSkeleton } from '@/components/Skeleton';

export default function GradesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  // Fetch data from API
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      setGrades(data.grades);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError('Failed to load grades');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchGrades()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleBulkDownload = () => {
    const bulkExportData: BulkGradeExport[] = students.map(student => {
      const studentGrades = grades.filter(grade => grade.studentId === student.id);
      const { bestGrade, bestPercentage, bestLetterGrade, averageGrade } = calculateBestGrade(studentGrades);
      
      return {
        studentId: student.id,
        studentName: student.name,
        registrationNumber: student.registrationNumber,
        class: student.cohort?.name || '',
        bestGrade,
        bestPercentage,
        bestLetterGrade,
        totalExercises: lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0),
        completedExercises: studentGrades.length,
        averageGrade,
        grades: studentGrades.map(grade => {
          const lesson = lessons.find(l => l.id === grade.lessonId);
          const exercise = lesson?.exercises.find(e => e.id === grade.exerciseId);
          return {
            lessonId: grade.lessonId,
            lessonTitle: lesson ? `Lesson ${lesson.number}: ${lesson.title}` : 'Unknown Lesson',
            exerciseId: grade.exerciseId,
            exerciseTitle: exercise?.title || 'Unknown Exercise',
            points: grade.totalPoints,
            maxPoints: exercise?.maxPoints || 16,
            percentage: grade.percentage,
            letterGrade: grade.letterGrade
          };
        })
      };
    });
    
    const csvContent = convertGradesToCSV(bulkExportData);
    downloadCSV(csvContent, 'grades-export.csv');
  };

  const filteredGrades = grades.filter(grade => {
    const lessonMatch = selectedLesson === 'all' || grade.lessonId === selectedLesson;
    const studentMatch = selectedStudent === 'all' || grade.studentId === selectedStudent;
    return lessonMatch && studentMatch;
  });

  const getLessonTitle = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? `Lesson ${lesson.number}: ${lesson.title}` : 'Unknown Lesson';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case 'A': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'B': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'C': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'D': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'F': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700';
    }
  };

  const averageGrade = filteredGrades.length > 0 
    ? Math.round(filteredGrades.reduce((sum, grade) => sum + grade.percentage, 0) / filteredGrades.length)
    : 0;

  const gradeDistribution = {
    A: filteredGrades.filter(g => g.letterGrade.startsWith('A')).length,
    B: filteredGrades.filter(g => g.letterGrade.startsWith('B')).length,
    C: filteredGrades.filter(g => g.letterGrade.startsWith('C')).length,
    D: filteredGrades.filter(g => g.letterGrade.startsWith('D')).length,
    F: filteredGrades.filter(g => g.letterGrade.startsWith('F')).length,
  };

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grades Overview</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">View and analyze student performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBulkDownload}
                className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Grades
              </button>
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:text-blue-400">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-400 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-12">
            <TableSkeleton rows={8} cols={6} />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Lesson</label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Lessons</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    Lesson {lesson.number}: {lesson.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Students</option>
                    {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Grades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredGrades.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageGrade}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Students Graded</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(filteredGrades.map(g => g.studentId)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Lessons Covered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(filteredGrades.map(g => g.lessonId)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getGradeColor(grade)}`}>
                  {grade}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Grades ({filteredGrades.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getStudentName(grade.studentId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getLessonTitle(grade.lessonId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {grade.totalPoints} / {lessons.find(l => l.id === grade.lessonId)?.exercises[0]?.maxPoints || 16}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade.letterGrade)}`}>
                          {grade.letterGrade}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">({grade.percentage}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {grade.feedback}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(grade.gradedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredGrades.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No grades found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {selectedLesson !== 'all' || selectedStudent !== 'all' 
                ? 'Try adjusting your filters.' 
                : 'Start grading exercises to see results here.'}
            </p>
          </div>
        )}
          </> 
        )}
      </main>
      </div>
    </ProtectedRoute>
  );
}
