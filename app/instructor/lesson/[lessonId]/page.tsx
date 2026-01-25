'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  ArrowLeft,
  FileText,
  HelpCircle,
  BarChart3,
  Users,
  Clock,
  Award,
  Edit,
  ExternalLink,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  X,
  Save,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  maxPoints: number;
  submissionCount: number;
  gradeCount: number;
  rubric: {
    id: string;
    name: string;
    description: string | null;
    totalPoints: number;
    criteria: Array<{
      id: string;
      name: string;
      description: string | null;
      weight: number;
    }>;
    levels: Array<{
      id: string;
      name: string;
      description: string | null;
      points: number;
      color: string | null;
    }>;
  };
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  order: number;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string | null;
  duration: string | null;
  courseId: string;
  course: {
    id: string;
    title: string;
    isActive: boolean;
  };
  exercises: Exercise[];
  quizQuestions: QuizQuestion[];
  stats: {
    exerciseCount: number;
    quizQuestionCount: number;
    quizAttemptCount: number;
    gradeCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function InstructorLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'exercises' | 'quiz'>('overview');
  const [rubrics, setRubrics] = useState<any[]>([]);
  
  // Exercise management
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState({
    title: '',
    description: '',
    maxPoints: 16,
    rubricId: '',
  });

  // Quiz question management
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', ''],
    correctAnswer: 0,
    explanation: '',
    order: 0,
  });

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
      fetchRubrics();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch lesson');
      }
      const data = await response.json();
      setLesson(data.lesson);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRubrics = async () => {
    try {
      const response = await fetch('/api/rubrics');
      if (response.ok) {
        const data = await response.json();
        setRubrics(data.rubrics || []);
      }
    } catch (error) {
      console.error('Error fetching rubrics:', error);
    }
  };

  // Exercise CRUD operations
  const handleAddExercise = async () => {
    if (!newExercise.title || !newExercise.rubricId) {
      setError('Title and rubric are required');
      return;
    }

    try {
      setError('');
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExercise,
          lessonId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create exercise');
      }

      await fetchLesson();
      setNewExercise({ title: '', description: '', maxPoints: 16, rubricId: '' });
      setShowExerciseForm(false);
      setSuccess('Exercise added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise || !editingExercise.title || !editingExercise.rubric.id) {
      setError('Title and rubric are required');
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/exercises/${editingExercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingExercise.title,
          description: editingExercise.description,
          maxPoints: editingExercise.maxPoints,
          rubricId: editingExercise.rubric.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update exercise');
      }

      await fetchLesson();
      setEditingExercise(null);
      setSuccess('Exercise updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete exercise');
      }

      await fetchLesson();
      setSuccess('Exercise deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Quiz question CRUD operations
  const handleAddQuestion = async () => {
    if (!newQuestion.question || newQuestion.options.length < 2) {
      setError('Question and at least 2 options are required');
      return;
    }

    if (newQuestion.options.some((opt) => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    try {
      setError('');
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuestion,
          lessonId,
          options: newQuestion.options.filter((opt) => opt.trim()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create quiz question');
      }

      await fetchLesson();
      setNewQuestion({ question: '', options: ['', ''], correctAnswer: 0, explanation: '', order: 0 });
      setShowQuizForm(false);
      setSuccess('Quiz question added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !editingQuestion.question || editingQuestion.options.length < 2) {
      setError('Question and at least 2 options are required');
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/quizzes/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editingQuestion.question,
          options: editingQuestion.options.filter((opt) => opt.trim()),
          correctAnswer: editingQuestion.correctAnswer,
          explanation: editingQuestion.explanation || null,
          order: editingQuestion.order,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update quiz question');
      }

      await fetchLesson();
      setEditingQuestion(null);
      setSuccess('Quiz question updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz question? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete quiz question');
      }

      await fetchLesson();
      setSuccess('Quiz question deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const addOption = () => {
    if (editingQuestion) {
      setEditingQuestion({ ...editingQuestion, options: [...editingQuestion.options, ''] });
    } else {
      setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    const currentQuestion = editingQuestion || newQuestion;
    if (currentQuestion.options.length <= 2) {
      setError('At least 2 options are required');
      return;
    }

    if (editingQuestion) {
      const newOptions = editingQuestion.options.filter((_, i) => i !== index);
      setEditingQuestion({
        ...editingQuestion,
        options: newOptions,
        correctAnswer: editingQuestion.correctAnswer >= newOptions.length ? 0 : editingQuestion.correctAnswer,
      });
    } else {
      const newOptions = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion({
        ...newQuestion,
        options: newOptions,
        correctAnswer: newQuestion.correctAnswer >= newOptions.length ? 0 : newQuestion.correctAnswer,
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (editingQuestion) {
      const newOptions = [...editingQuestion.options];
      newOptions[index] = value;
      setEditingQuestion({ ...editingQuestion, options: newOptions });
    } else {
      const newOptions = [...newQuestion.options];
      newOptions[index] = value;
      setNewQuestion({ ...newQuestion, options: newOptions });
    }
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

  if (!lesson) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error || 'Lesson not found'}
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
          <div className="mb-6">
            <Link
              href={`/instructor/courses/${lesson.courseId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Lesson {lesson.number}: {lesson.title}
                  </h1>
                  <Link
                    href={`/instructor/courses/${lesson.courseId}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {lesson.course.title}
                  </Link>
                </div>
                {lesson.description && (
                  <p className="text-gray-600 mt-2">{lesson.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  {lesson.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.duration}
                    </div>
                  )}
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {lesson.stats.exerciseCount} exercises
                  </div>
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    {lesson.stats.quizQuestionCount} quiz questions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">{lesson.stats.exerciseCount}</div>
              <div className="text-blue-100 text-sm mt-1">Exercises</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <HelpCircle className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">{lesson.stats.quizQuestionCount}</div>
              <div className="text-green-100 text-sm mt-1">Quiz Questions</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">{lesson.stats.quizAttemptCount}</div>
              <div className="text-purple-100 text-sm mt-1">Quiz Attempts</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 opacity-80" />
              </div>
              <div className="text-3xl font-bold">{lesson.stats.gradeCount}</div>
              <div className="text-orange-100 text-sm mt-1">Grades Given</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('exercises')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'exercises'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Exercises ({lesson.exercises.length})
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'quiz'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Quiz Questions ({lesson.quizQuestions.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Lesson Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lesson Number:</span>
                        <span className="font-medium text-gray-900">{lesson.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium text-gray-900">{lesson.title}</span>
                      </div>
                      {lesson.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium text-gray-900 text-right max-w-md">{lesson.description}</span>
                        </div>
                      )}
                      {lesson.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">{lesson.duration}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course:</span>
                        <Link
                          href={`/instructor/courses/${lesson.courseId}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {lesson.course.title}
                        </Link>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href={`/instructor/lesson/${lessonId}/notes`}
                        className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Manage Notes</div>
                          <div className="text-sm text-gray-600">Edit lesson notes and content</div>
                        </div>
                      </Link>
                      <button
                        onClick={() => setActiveTab('exercises')}
                        className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left w-full"
                      >
                        <Award className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Grade Exercises</div>
                          <div className="text-sm text-gray-600">Review and grade student submissions</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Exercises Tab */}
              {activeTab === 'exercises' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
                    <button
                      onClick={() => {
                        setNewExercise({ title: '', description: '', maxPoints: 16, rubricId: '' });
                        setShowExerciseForm(true);
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </button>
                  </div>
                  {lesson.exercises.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exercises</h3>
                      <p className="text-gray-600 mb-4">This lesson doesn't have any exercises yet.</p>
                      <button
                        onClick={() => {
                          setNewExercise({ title: '', description: '', maxPoints: 16, rubricId: '' });
                          setShowExerciseForm(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercise
                      </button>
                    </div>
                  ) : (
                    lesson.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
                                {exercise.description && (
                                  <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Award className="h-4 w-4 mr-1" />
                                {exercise.maxPoints} points
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {exercise.submissionCount} submissions
                              </span>
                              <span className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {exercise.gradeCount} graded
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Link
                              href={`/instructor/exercise/${exercise.id}/grade`}
                              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              title="Grade Exercise"
                            >
                              <ClipboardCheck className="h-4 w-4 mr-1" />
                              Grade
                            </Link>
                            <button
                              onClick={() => setEditingExercise(exercise)}
                              className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExercise(exercise.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Rubric Preview */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Rubric: {exercise.rubric.name}</h4>
                            <Link
                              href={`/instructor/rubric/${exercise.rubric.id}/edit`}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Link>
                          </div>
                          {exercise.rubric.description && (
                            <p className="text-xs text-gray-600 mb-3">{exercise.rubric.description}</p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {exercise.rubric.criteria.map((criteria) => (
                              <div key={criteria.id} className="bg-gray-50 rounded p-2">
                                <div className="text-xs font-medium text-gray-900">{criteria.name}</div>
                                <div className="text-xs text-gray-600">Weight: {criteria.weight}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Quiz Questions Tab */}
              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quiz Questions</h3>
                    <button
                      onClick={() => {
                        setNewQuestion({ question: '', options: ['', ''], correctAnswer: 0, explanation: '', order: lesson.quizQuestions.length });
                        setShowQuizForm(true);
                      }}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </button>
                  </div>
                  {lesson.quizQuestions.length === 0 ? (
                    <div className="text-center py-12">
                      <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quiz Questions</h3>
                      <p className="text-gray-600 mb-4">This lesson doesn't have any quiz questions yet.</p>
                      <button
                        onClick={() => {
                          setNewQuestion({ question: '', options: ['', ''], correctAnswer: 0, explanation: '', order: 0 });
                          setShowQuizForm(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </button>
                    </div>
                  ) : (
                    lesson.quizQuestions.map((question, index) => (
                      <div
                        key={question.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-purple-100 p-2 rounded-lg">
                                <HelpCircle className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                                  {question.order > 0 && (
                                    <span className="text-xs text-gray-400">(Order: {question.order})</span>
                                  )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mt-1">{question.question}</h3>
                              </div>
                            </div>

                            <div className="ml-11 space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    optIndex === question.correctAnswer
                                      ? 'border-green-300 bg-green-50'
                                      : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {optIndex === question.correctAnswer && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    <span className="text-sm text-gray-900">{option}</span>
                                    {optIndex === question.correctAnswer && (
                                      <span className="ml-auto text-xs font-medium text-green-600">Correct Answer</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {question.explanation && (
                              <div className="ml-11 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-xs font-medium text-blue-900 mb-1">Explanation:</div>
                                <div className="text-sm text-blue-800">{question.explanation}</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => setEditingQuestion(question)}
                              className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Exercise Form Modal */}
          {(showExerciseForm || editingExercise) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowExerciseForm(false);
                      setEditingExercise(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingExercise?.title || newExercise.title}
                      onChange={(e) =>
                        editingExercise
                          ? setEditingExercise({ ...editingExercise, title: e.target.value })
                          : setNewExercise({ ...newExercise, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingExercise?.description || newExercise.description}
                      onChange={(e) =>
                        editingExercise
                          ? setEditingExercise({ ...editingExercise, description: e.target.value })
                          : setNewExercise({ ...newExercise, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Points</label>
                      <input
                        type="number"
                        value={editingExercise?.maxPoints || newExercise.maxPoints}
                        onChange={(e) =>
                          editingExercise
                            ? setEditingExercise({ ...editingExercise, maxPoints: parseInt(e.target.value) || 16 })
                            : setNewExercise({ ...newExercise, maxPoints: parseInt(e.target.value) || 16 })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rubric <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingExercise?.rubric.id || newExercise.rubricId}
                        onChange={(e) =>
                          editingExercise
                            ? setEditingExercise({
                                ...editingExercise,
                                rubric: rubrics.find((r) => r.id === e.target.value) || editingExercise.rubric,
                              })
                            : setNewExercise({ ...newExercise, rubricId: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Rubric</option>
                        {rubrics.map((rubric) => (
                          <option key={rubric.id} value={rubric.id}>
                            {rubric.name} ({rubric.totalPoints} points)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={editingExercise ? handleUpdateExercise : handleAddExercise}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {editingExercise ? 'Update Exercise' : 'Add Exercise'}
                    </button>
                    <button
                      onClick={() => {
                        setShowExerciseForm(false);
                        setEditingExercise(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Question Form Modal */}
          {(showQuizForm || editingQuestion) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingQuestion ? 'Edit Quiz Question' : 'Add New Quiz Question'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowQuizForm(false);
                      setEditingQuestion(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editingQuestion?.question || newQuestion.question}
                      onChange={(e) =>
                        editingQuestion
                          ? setEditingQuestion({ ...editingQuestion, question: e.target.value })
                          : setNewQuestion({ ...newQuestion, question: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editingQuestion?.options || newQuestion.options).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={
                              (editingQuestion?.correctAnswer ?? newQuestion.correctAnswer) === index
                            }
                            onChange={() =>
                              editingQuestion
                                ? setEditingQuestion({ ...editingQuestion, correctAnswer: index })
                                : setNewQuestion({ ...newQuestion, correctAnswer: index })
                            }
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          {(editingQuestion?.options || newQuestion.options).length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Select the radio button next to the correct answer
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={editingQuestion?.explanation || newQuestion.explanation}
                      onChange={(e) =>
                        editingQuestion
                          ? setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                          : setNewQuestion({ ...newQuestion, explanation: e.target.value })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order (Optional)</label>
                    <input
                      type="number"
                      value={editingQuestion?.order ?? newQuestion.order}
                      onChange={(e) =>
                        editingQuestion
                          ? setEditingQuestion({ ...editingQuestion, order: parseInt(e.target.value) || 0 })
                          : setNewQuestion({ ...newQuestion, order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first. Leave as 0 for auto-ordering.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {editingQuestion ? 'Update Question' : 'Add Question'}
                    </button>
                    <button
                      onClick={() => {
                        setShowQuizForm(false);
                        setEditingQuestion(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

