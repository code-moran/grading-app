'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Search,
  User,
  FileText,
  ExternalLink,
  Award,
  Clock,
  Github,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface RubricLevel {
  id: string;
  name: string;
  description: string | null;
  points: number;
  color: string | null;
}

interface RubricCriteria {
  id: string;
  name: string;
  description: string | null;
  weight: number;
}

interface Rubric {
  id: string;
  name: string;
  description: string | null;
  totalPoints: number;
  criteria: RubricCriteria[];
  levels: RubricLevel[];
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  maxPoints: number;
  lesson: {
    id: string;
    number: number;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  rubric: Rubric;
}

interface Submission {
  id: string;
  githubUrl: string;
  codingStandards: any;
  status: string;
  submittedAt: string;
}

interface Grade {
  id: string;
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  letterGrade: string;
  feedback: string | null;
  gradedBy: string;
  gradedAt: string;
  criteriaGrades: Array<{
    criteriaId: string;
    levelId: string;
    points: number;
    comments: string | null;
    criteria: { id: string; name: string };
    level: { id: string; name: string; points: number };
  }>;
}

interface Student {
  id: string;
  name: string;
  email: string | null;
  registrationNumber: string;
  cohortId: string | null;
  cohort: { id: string; name: string } | null;
  submission: Submission | null;
  grade: Grade | null;
}

export default function ExerciseGradingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<{
    [criteriaId: string]: { levelId: string; points: number; comments: string };
  }>({});
  const [feedback, setFeedback] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExercise();
    fetchStudents();
  }, [exerciseId]);

  // Handle student selection from URL parameter
  useEffect(() => {
    const studentIdFromUrl = searchParams.get('studentId');
    if (studentIdFromUrl && students.length > 0) {
      const studentToSelect = students.find((s) => s.id === studentIdFromUrl);
      // Only update if the student from URL is different from currently selected
      if (studentToSelect && selectedStudent?.id !== studentIdFromUrl) {
        setSelectedStudent(studentToSelect);
      }
    }
  }, [students, searchParams]);

  const fetchExercise = async () => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exercise');
      }
      const data = await response.json();
      setExercise(data.exercise);
    } catch (error) {
      console.error('Error fetching exercise:', error);
      setError('Failed to load exercise');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exercises/${exerciseId}/students`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Load existing grade when student is selected
  useEffect(() => {
    if (selectedStudent) {
      if (selectedStudent.grade) {
        setFeedback(selectedStudent.grade.feedback || '');
        const loadedGrades: {
          [criteriaId: string]: {
            levelId: string;
            points: number;
            comments: string;
          };
        } = {};
        selectedStudent.grade.criteriaGrades.forEach((criteriaGrade) => {
          loadedGrades[criteriaGrade.criteriaId] = {
            levelId: criteriaGrade.levelId,
            points: criteriaGrade.points,
            comments: criteriaGrade.comments || '',
          };
        });
        setGrades(loadedGrades);
      } else {
        setFeedback('');
        setGrades({});
      }
    }
  }, [selectedStudent]);

  const handleGradeChange = (criteriaId: string, levelId: string, points: number) => {
    setGrades((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        levelId,
        points,
        comments: prev[criteriaId]?.comments || '',
      },
    }));
  };

  const handleCommentsChange = (criteriaId: string, comments: string) => {
    setGrades((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        comments,
      },
    }));
  };

  const calculateTotalPoints = () => {
    if (!exercise) return 0;
    return exercise.rubric.criteria.reduce((total, criteria) => {
      const grade = grades[criteria.id];
      return total + (grade?.points || 0);
    }, 0);
  };

  const calculatePercentage = () => {
    if (!exercise) return 0;
    const totalPoints = calculateTotalPoints();
    return Math.round((totalPoints / exercise.maxPoints) * 100);
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleSave = async () => {
    if (!selectedStudent || !exercise) {
      setError('Please select a student and ensure exercise is loaded');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const totalPoints = calculateTotalPoints();
      const percentage = calculatePercentage();
      const letterGrade = getLetterGrade(percentage);

      // Convert grades to the format expected by the API
      const criteriaGrades = Object.entries(grades).map(([criteriaId, grade]) => ({
        criteriaId,
        levelId: grade.levelId,
        points: grade.points,
        comments: grade.comments,
      }));

      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          lessonId: exercise.lesson.id,
          exerciseId: exercise.id,
          criteriaGrades,
          totalPoints,
          maxPossiblePoints: exercise.maxPoints,
          percentage,
          letterGrade,
          feedback,
          gradedBy: 'Instructor',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save grade');
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      // Refresh students to get updated grade
      await fetchStudents();

      // Update selected student's grade
      const updatedStudent = students.find((s) => s.id === selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      setError(error instanceof Error ? error.message : 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Exercise not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The requested exercise could not be found.</p>
        </div>
      </div>
    );
  }

  const totalPoints = calculateTotalPoints();
  const percentage = calculatePercentage();
  const letterGrade = getLetterGrade(percentage);

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
              <div className="flex items-center space-x-4">
                {exercise && (
                  <Link
                    href={`/instructor/lesson/${exercise.lesson.id}`}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:text-blue-400 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Back to Lesson</span>
                    <span className="sm:hidden">Back</span>
                  </Link>
                )}
                {exercise && <div className="h-6 w-px bg-gray-300" />}
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{exercise?.title || 'Loading...'}</h1>
                  {exercise && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {exercise.lesson.course.title} • Lesson {exercise.lesson.number}:{' '}
                      {exercise.lesson.title}
                    </p>
                  )}
                </div>
              </div>
              {selectedStudent && (
                <div className="flex items-center space-x-4">
                  {isSaved && (
                    <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Saved!</span>
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200 flex items-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Student Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Students</h3>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-3 py-2 rounded mb-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">Loading students...</span>
                  </div>
                )}

                {/* Students List */}
                {!loading && !error && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">
                        {searchTerm
                          ? 'No students found matching your search.'
                          : 'No students enrolled.'}
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`w-full text-left p-3 rounded-md border transition-colors duration-200 ${
                            selectedStudent?.id === student.id
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {student.registrationNumber}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {student.submission && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                Submitted
                              </span>
                            )}
                            {student.grade && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 px-2 py-0.5 rounded">
                                Graded
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Grading Interface */}
            <div className="lg:col-span-3">
              {selectedStudent ? (
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedStudent.name}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            {selectedStudent.registrationNumber}
                            {selectedStudent.cohort && ` • ${selectedStudent.cohort.name}`}
                          </p>
                        </div>
                      </div>
                      {selectedStudent.grade && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {selectedStudent.grade.letterGrade}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedStudent.grade.totalPoints}/{exercise.maxPoints} points
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Exercise Description */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">{exercise.title}</p>
                      {exercise.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{exercise.description}</p>
                      )}
                    </div>

                    {/* Submission Info */}
                    {selectedStudent.submission && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Github className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-gray-900 dark:text-white">Submission</span>
                            </div>
                            <a
                              href={selectedStudent.submission.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm flex items-center space-x-1"
                            >
                              <span>View on GitHub</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                              Submitted:{' '}
                              {new Date(selectedStudent.submission.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedStudent.submission.status === 'approved'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : selectedStudent.submission.status === 'needs_revision'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'
                                : selectedStudent.submission.status === 'rejected'
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {selectedStudent.submission.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rubric */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assessment Rubric</h3>
                      <Link
                        href={`/instructor/rubric/${exercise.rubric.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Rubric
                      </Link>
                    </div>
                    <div className="space-y-6">
                      {exercise.rubric.criteria.map((criteria) => (
                        <div
                          key={criteria.id}
                          className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 transition-colors"
                        >
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {criteria.name}
                              </h4>
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                                {criteria.weight}% weight
                              </span>
                            </div>
                            {criteria.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{criteria.description}</p>
                            )}
                          </div>

                          {/* Rating Levels */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {exercise.rubric.levels.map((level) => {
                              const isSelected = grades[criteria.id]?.levelId === level.id;
                              return (
                                <button
                                  key={level.id}
                                  onClick={() =>
                                    handleGradeChange(criteria.id, level.id, level.points)
                                  }
                                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                    isSelected
                                      ? level.color
                                        ? `${level.color} border-current shadow-md scale-105`
                                        : 'bg-blue-50 text-blue-800 border-blue-500 shadow-md scale-105'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800 hover:shadow-sm'
                                  }`}
                                >
                                  <div className="font-semibold text-sm mb-1">{level.name}</div>
                                  {level.description && (
                                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                      {level.description}
                                    </div>
                                  )}
                                  <div className="text-xs font-medium opacity-75">
                                    {level.points} points
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Comments */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Feedback Comments
                            </label>
                            <textarea
                              value={grades[criteria.id]?.comments || ''}
                              onChange={(e) => handleCommentsChange(criteria.id, e.target.value)}
                              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              rows={3}
                              placeholder="Add specific feedback for this criteria..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overall Feedback */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Overall Feedback</h3>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows={4}
                      placeholder="Provide overall feedback for the student's work..."
                    />
                  </div>

                  {/* Grade Summary */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-bold mb-6">Grade Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center bg-white dark:bg-gray-800/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-3xl font-bold">{totalPoints}</div>
                        <div className="text-sm opacity-90 mt-1">Points Earned</div>
                      </div>
                      <div className="text-center bg-white dark:bg-gray-800/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-3xl font-bold">{exercise.maxPoints}</div>
                        <div className="text-sm opacity-90 mt-1">Max Points</div>
                      </div>
                      <div className="text-center bg-white dark:bg-gray-800/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-3xl font-bold">{percentage}%</div>
                        <div className="text-sm opacity-90 mt-1">Percentage</div>
                      </div>
                      <div className="text-center bg-white dark:bg-gray-800/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-3xl font-bold">{letterGrade}</div>
                        <div className="text-sm opacity-90 mt-1">Letter Grade</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select a Student</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose a student from the sidebar to begin grading.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

