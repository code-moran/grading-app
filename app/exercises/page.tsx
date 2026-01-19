'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  X,
  Save,
  Filter,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Award,
  Users,
  ArrowLeft,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Rubric {
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
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  maxPoints: number;
  lessonId: string;
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
  stats: {
    gradeCount: number;
    submissionCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  course: {
    id: string;
    title: string;
  };
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [lessonFilter, setLessonFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState({
    title: '',
    description: '',
    maxPoints: 16,
    lessonId: '',
    rubricId: '',
  });

  useEffect(() => {
    fetchExercises();
    fetchLessons();
    fetchRubrics();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises');
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const data = await response.json();
      setExercises(data.exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
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

  const handleAddExercise = async () => {
    if (!newExercise.title || !newExercise.lessonId || !newExercise.rubricId) {
      setError('Title, lesson, and rubric are required');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExercise),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create exercise');
      }

      const data = await response.json();
      setExercises([...exercises, data.exercise]);
      setNewExercise({
        title: '',
        description: '',
        maxPoints: 16,
        lessonId: '',
        rubricId: '',
      });
      setShowAddForm(false);
      setSuccess('Exercise added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create exercise');
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;
    if (!editingExercise.title || !editingExercise.lessonId || !editingExercise.rubric.id) {
      setError('Title, lesson, and rubric are required');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/exercises/${editingExercise.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

      const data = await response.json();
      setExercises(exercises.map((e) => (e.id === editingExercise.id ? data.exercise : e)));
      setEditingExercise(null);
      setSuccess('Exercise updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update exercise');
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete exercise');
      }

      setExercises(exercises.filter((exercise) => exercise.id !== id));
      setSuccess('Exercise deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete exercise');
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.lesson.course.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLesson = !lessonFilter || exercise.lessonId === lessonFilter;

    return matchesSearch && matchesLesson;
  });

  const resetForm = () => {
    setNewExercise({
      title: '',
      description: '',
      maxPoints: 16,
      lessonId: '',
      rubricId: '',
    });
    setShowAddForm(false);
    setEditingExercise(null);
  };

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/instructor"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Exercise Management</h1>
            <p className="text-gray-600">Create and manage exercises for lessons</p>
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

          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {lessons.length > 0 && (
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={lessonFilter}
                      onChange={(e) => setLessonFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
                    >
                      <option value="">All Lessons</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          Lesson {lesson.number}: {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Exercise
              </button>
            </div>
          </div>

          {/* Add/Edit Form Modal */}
          {(showAddForm || editingExercise) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingExercise?.lessonId || newExercise.lessonId}
                        onChange={(e) =>
                          editingExercise
                            ? setEditingExercise({ ...editingExercise, lessonId: e.target.value })
                            : setNewExercise({ ...newExercise, lessonId: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Lesson</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            Lesson {lesson.number}: {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Points
                      </label>
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
                    {rubrics.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No rubrics available. Please create a rubric first.
                      </p>
                    )}
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
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exercises Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No exercises found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || lessonFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first exercise'}
              </p>
              {!searchTerm && !lessonFilter && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Exercise
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exercise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lesson
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rubric
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExercises.map((exercise) => (
                      <tr key={exercise.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{exercise.title}</div>
                          {exercise.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {exercise.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <Link
                              href={`/instructor/lesson/${exercise.lessonId}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Lesson {exercise.lesson.number}
                            </Link>
                          </div>
                          <div className="text-xs text-gray-500">{exercise.lesson.course.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{exercise.rubric.name}</div>
                          <div className="text-xs text-gray-500">
                            {exercise.rubric.criteria.length} criteria, {exercise.rubric.levels.length} levels
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{exercise.maxPoints}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              {exercise.stats.gradeCount}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {exercise.stats.submissionCount}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/instructor/exercise/${exercise.id}/grade`}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Grade Exercise"
                            >
                              <ClipboardCheck className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setEditingExercise(exercise)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <strong>{filteredExercises.length}</strong> of <strong>{exercises.length}</strong> exercises
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}


