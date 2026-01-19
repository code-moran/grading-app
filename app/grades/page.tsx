'use client';

import { useState, useEffect } from 'react';
import { lessons } from '@/lib/lessons';
import { Grade, Student, BulkGradeExport } from '@/lib/types';
import { BarChart3, TrendingUp, Users, BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { convertGradesToCSV, downloadCSV, calculateBestGrade } from '@/lib/utils';

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
        class: student.class,
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
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Grades Overview</h1>
              <p className="text-sm text-gray-600">View and analyze student performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBulkDownload}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Grades
              </button>
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading grades...</span>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Lesson</label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Students</option>
                    {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Grades</p>
                <p className="text-2xl font-bold text-gray-900">{filteredGrades.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">{averageGrade}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students Graded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredGrades.map(g => g.studentId)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lessons Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredGrades.map(g => g.lessonId)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getGradeColor(grade)}`}>
                  {grade}
                </div>
                <div className="mt-2 text-sm text-gray-600">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
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
                    Lesson
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getStudentName(grade.studentId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getLessonTitle(grade.lessonId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {grade.totalPoints} / {lessons.find(l => l.id === grade.lessonId)?.exercises[0]?.maxPoints || 16}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade.letterGrade)}`}>
                          {grade.letterGrade}
                        </span>
                        <span className="text-sm text-gray-600">({grade.percentage}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {grade.feedback}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(grade.gradedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredGrades.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No grades found</h3>
            <p className="text-gray-600">
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
  );
}
