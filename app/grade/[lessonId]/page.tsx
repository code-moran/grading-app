'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { lessons } from '@/lib/lessons';
import { Lesson, Student, Grade, RubricLevel } from '@/lib/types';
import { ArrowLeft, Save, CheckCircle, AlertCircle, Search, User, FileText } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function GradingPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedExercise, setSelectedExercise] = useState(0);
  const [grades, setGrades] = useState<{ [criteriaId: string]: { levelId: string; points: number; comments: string } }>({});
  const [feedback, setFeedback] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
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

  useEffect(() => {
    const foundLesson = lessons.find(l => l.id === lessonId);
    setLesson(foundLesson || null);
    fetchStudents();
  }, [lessonId]);

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Load existing grade for selected student and exercise
  const loadExistingGrade = async (studentId: string, exerciseId: string) => {
    try {
      const response = await fetch(`/api/grades?studentId=${studentId}&exerciseId=${exerciseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.grades && data.grades.length > 0) {
          const existingGrade = data.grades[0];
          setFeedback(existingGrade.feedback || '');
          
          // Load criteria grades
          const loadedGrades: { [criteriaId: string]: { levelId: string; points: number; comments: string } } = {};
          if (existingGrade.gradeCriteria) {
            existingGrade.gradeCriteria.forEach((criteriaGrade: any) => {
              loadedGrades[criteriaGrade.criteriaId] = {
                levelId: criteriaGrade.levelId,
                points: criteriaGrade.points,
                comments: criteriaGrade.comments || ''
              };
            });
          }
          setGrades(loadedGrades);
        }
      }
    } catch (error) {
      console.error('Error loading existing grade:', error);
    }
  };

  // Load existing grade when student or exercise changes
  useEffect(() => {
    if (selectedStudent && lesson) {
      const exercise = lesson.exercises[selectedExercise];
      loadExistingGrade(selectedStudent.id, exercise.id);
    }
  }, [selectedStudent, selectedExercise, lesson]);

  const handleGradeChange = (criteriaId: string, levelId: string, points: number) => {
    setGrades(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        levelId,
        points,
        comments: prev[criteriaId]?.comments || ''
      }
    }));
  };

  const handleCommentsChange = (criteriaId: string, comments: string) => {
    setGrades(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        comments
      }
    }));
  };

  const calculateTotalPoints = () => {
    if (!lesson) return 0;
    const exercise = lesson.exercises[selectedExercise];
    return exercise.rubric.criteria.reduce((total, criteria) => {
      const grade = grades[criteria.id];
      return total + (grade?.points || 0);
    }, 0);
  };

  const calculatePercentage = () => {
    if (!lesson) return 0;
    const exercise = lesson.exercises[selectedExercise];
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
    if (!selectedStudent || !lesson) {
      setError('Please select a student and ensure lesson is loaded');
      return;
    }

    try {
      const exercise = lesson.exercises[selectedExercise];
      const totalPoints = calculateTotalPoints();
      const percentage = calculatePercentage();
      const letterGrade = getLetterGrade(percentage);

      // Convert grades to the format expected by the API
      const criteriaGrades = Object.entries(grades).map(([criteriaId, grade]) => ({
        criteriaId,
        levelId: grade.levelId,
        points: grade.points,
        comments: grade.comments
      }));

      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          lessonId: lesson.id,
          exerciseId: exercise.id,
          criteriaGrades,
          totalPoints,
          percentage,
          letterGrade,
          feedback,
          gradedBy: 'Instructor'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save grade');
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      // Clear the form after successful save
      setGrades({});
      setFeedback('');
      
    } catch (error) {
      console.error('Error saving grade:', error);
      setError(error instanceof Error ? error.message : 'Failed to save grade');
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Lesson not found</h2>
          <p className="text-gray-600">The requested lesson could not be found.</p>
        </div>
      </div>
    );
  }

  const exercise = lesson.exercises[selectedExercise];
  const totalPoints = calculateTotalPoints();
  const percentage = calculatePercentage();
  const letterGrade = getLetterGrade(percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/instructor" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-600">Lesson {lesson.number} • {lesson.duration}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isSaved && (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Saved!</span>
                </div>
              )}
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200 flex items-center hover:scale-105"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Grade
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Student Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Student Selection</h3>
              </div>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600 text-sm">Loading students...</span>
                </div>
              )}

              {/* Students List */}
              {!loading && !error && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`w-full text-left p-3 rounded-md border transition-colors duration-200 ${
                          selectedStudent?.id === student.id
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.studentId}</div>
                        {student.registrationNumber && (
                          <div className="text-xs text-gray-500">Reg: {student.registrationNumber}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Exercise Selection */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Exercise</h3>
              </div>
              <div className="space-y-2">
                {lesson.exercises.map((exercise, index) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedExercise === index
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold mb-1">{exercise.title}</div>
                    <div className="text-sm text-gray-600">Max: {exercise.maxPoints} points</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grading Interface */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Grading: {selectedStudent.name}
                      </h2>
                      <p className="text-sm text-gray-500">{selectedStudent.studentId}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-medium text-gray-900 mb-1">{exercise.title}</p>
                    <p className="text-sm text-gray-600">{exercise.description}</p>
                  </div>
                </div>

                {/* Rubric */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Assessment Rubric</h3>
                  <div className="space-y-6">
                    {exercise.rubric.criteria.map((criteria) => (
                      <div key={criteria.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg">{criteria.name}</h4>
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                              {criteria.weight}% weight
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{criteria.description}</p>
                        </div>

                        {/* Rating Levels */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          {exercise.rubric.levels.map((level) => (
                            <button
                              key={level.id}
                              onClick={() => handleGradeChange(criteria.id, level.id, level.points)}
                              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                grades[criteria.id]?.levelId === level.id
                                  ? `${level.color} border-current shadow-md scale-105`
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                              }`}
                            >
                              <div className="font-semibold text-sm mb-1">{level.name}</div>
                              <div className="text-xs text-gray-600 mb-2">{level.description}</div>
                              <div className="text-xs font-medium opacity-75">{level.points} points</div>
                            </button>
                          ))}
                        </div>

                        {/* Comments */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Feedback Comments
                          </label>
                          <textarea
                            value={grades[criteria.id]?.comments || ''}
                            onChange={(e) => handleCommentsChange(criteria.id, e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            rows={3}
                            placeholder="Add specific feedback for this criteria..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Feedback */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Feedback</h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows={4}
                    placeholder="Provide overall feedback for the student's work..."
                  />
                </div>

                {/* Grade Summary */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-6">Grade Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold">{totalPoints}</div>
                      <div className="text-sm opacity-90 mt-1">Points Earned</div>
                    </div>
                    <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold">{exercise.maxPoints}</div>
                      <div className="text-sm opacity-90 mt-1">Max Points</div>
                    </div>
                    <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold">{percentage}%</div>
                      <div className="text-sm opacity-90 mt-1">Percentage</div>
                    </div>
                    <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold">{letterGrade}</div>
                      <div className="text-sm opacity-90 mt-1">Letter Grade</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">Choose a student from the sidebar to begin grading.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
